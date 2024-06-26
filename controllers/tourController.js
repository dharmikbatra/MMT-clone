const Tour = require('./../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('../controllers/handlerFactory')
const multer = require('multer')
const sharp = require('sharp')


const multerStorage = multer.memoryStorage()

const multerFilter = (req,file,cb) => {
    if( file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image, upload images only', 400),false)
    }
}
const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadTourImages = upload.fields([
    {name:'imageCover', maxCount:1},
    {name:'images', maxCount:3}
])


// upload.single('image') // for only single image
// upload.array('images',3)  // for only array

exports.resizeTourImages = catchAsync(async (req,res,next) => {
    // console.log(req.files)
    if(!req.files.imageCover || !req.files.images){return next()}

    // cover image
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${imageCoverFilename}`)

    req.body.imageCover = imageCoverFilename
    // other images
    req.body.images = []

    await Promise.all( req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
            console.log("hi")

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/tours/${filename}`)

        req.body.images.push(filename)
        }))
    next()
})

exports.aliasTopTours = (req,res,next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary'
    next()
}


// exports.checkID = (req,res,next,val) => {
//     if (req.params.id *1 > tours.length){
//         return res.status(404).json({
//             status:'fail',
//             message:'Invalid ID'
//         })
//     }
//     next();
// }

// exports.checkBody = (req,res,next) => {
//     if (!(req.body.name && req.body.price)){
//         return res.status(400).json({
//             status:'fail',
//             message:'invalid object creation'
//         })
//     }
//     next();
// }

exports.getAllRoutes = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, {path:'reviews'})

// catchAsync(async (req,res,next) => {
//         const tour = await Tour.findById(req.params.id).populate('reviews')
//         // .populate({  // populate:creates a separate query, performance kharab hogi
//         //     path:'guides',
//         //     select:'-__v -passwordChangedAt'
//         // })
//         if (!tour){
//             return next(new AppError('no tour found', 404))
//         }
//         res.status(200).json({
//             status:'success',
//             data:{tour}
//         })
// })

// exports.createTour = catchAsync (async (req,res,next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status:"success",
//         data:{
//             tour:newTour
//         }
//     })

// })
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.createTour = factory.createOne(Tour);


// exports.deleteTour = catchAsync(async (req,res,next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)
//     if (!tour){
//         return next(new AppError('no tour found', 404))
//     }
//     res.status(204).json({
//         status:'success',
//         data:""
//     })
// })


exports.getTourStats = catchAsync(async (req,res,next) => {
    const stats = await Tour.aggregate([
            {$match:{ratingsAverage:{$gte:4.5}}},
            {$group:{
                _id:'$difficulty',
                num:{$sum:1},
                numRatings:{$sum:'$ratingsQuantity'},
                avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
            }},
            {
                $sort: {avgPrice:-1}
            // },
            // {
                // $match : {_id : {$ne: 'easy'}}
            }
    ])
    res.status(200).json({
        status:'success',
        data:{
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind:'$startDates'
        },
        {
            $match:{
                startDates:{
                    $gte:new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id:{$month:'$startDates'},
                numTOursEachMonth:{$sum:1},
                tours:{$push: '$name'}
            }
        },
        {$sort:{numTOursEachMonth:-1}},
        {$addFields:{month:'$_id'} },
        {$project : {
            _id:0
        }},
        {$limit:12}
    ])

    res.status(200).json({
        status:'success',
        data:{plan}
    })
})

exports.getToursWithin = catchAsync(async (req,res,next) => {
    const {distance, latlong, unit} = req.params
    const [lat,long] = latlong.split(',')

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1 //radius should be in radians, distance/ radius of earth (convention)
    if(!lat || !long){
        // console.log("dhbatra")
        next(new AppError("please provide latitude and longitude in this order: lat,long", 400))
    }
    const tours = await Tour.find(
        {
            startLocation:{
                $geoWithin:{
                    $centerSphere:[[long,lat],radius]
                }
            }
        })


    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{data:tours}
    })

})

exports.getDistances = catchAsync(async (req,res,next) => {
    const {latlong, unit} = req.params
    const [lat,long] = latlong.split(',')

    if(!lat || !long){
        // console.log("dhbatra")
        next(new AppError("please provide latitude and longitude in this order: lat,long", 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[long*1, lat*1]
                },
                distanceField:'distance', // initially comes in metres
                distanceMultiplier:unit==='km'?0.001:0.000621371
            }
        },{
            $project:{
                distance:1,
                name:1
            }
        }
    ])




    res.status(200).json({
        status:"success",
        results:distances.length,
        data:{data:distances}
    })

})


//router.route('/tours-within/233/center/34.324234,23.85268,/unit/:unit', tourController.getToursWithin)