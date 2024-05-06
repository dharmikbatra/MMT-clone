const Tour = require('./../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

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

exports.getAllRoutes = catchAsync(async (req,res,next) => {
    const features = new APIFeatures(Tour.find(),req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate()
    console.log("features made")
    const tours = await features.query;
    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            tours
        }
    })
})

exports.getTour = catchAsync(async (req,res,next) => {
        const tour = await Tour.findById(req.params.id)
        if (!tour){
            return next(new AppError('no tour found', 404))
        }
        res.status(200).json({
            status:'success',
            data:{tour}
        })
})

exports.createTour = catchAsync (async (req,res,next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status:"success",
        data:{
            tour:newTour
        }
    })

})

exports.updateTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id,
        req.body,
        {
            new:true,
            runValidators:true
        })
    if (!tour){
        return next(new AppError('no tour found', 404))
    }
    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })
})

exports.deleteTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    if (!tour){
        return next(new AppError('no tour found', 404))
    }
    res.status(204).json({
        status:'success',
        data:""
    })
})

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