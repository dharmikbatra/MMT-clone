// exports.getBase = (req, res) => {
//     res.status(200).render('base', {
//         tour:'forest hiker',
//         user:'dharmik'
//     })
// }

const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")


exports.getTour = catchAsync(async (req,res,next) => {
    const newTour = await Tour.findOne({slug:req.params.tourSlug}).populate({
        path:'reviews',
        // fields:'review user rating'
    })
    // console.log(newTour.reviews)

    res.status(200).render('tour',{
        title:newTour.name,
        tour:newTour
    })
})


exports.getOverview =  catchAsync(async (req,res, next) => {
    // build tour data from collection
    const tours = await Tour.find()
    // build template
    // render that template using tour data from 1
    res.status(200).render('overview',{
        title:'All Tours',
        tours:tours
    })
})

exports.getLoginForm = catchAsync(async (req,res,next) => {
    res.status(200).render('login', {
        title:'Login to your account'
    })
})