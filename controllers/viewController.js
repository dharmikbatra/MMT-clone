// exports.getBase = (req, res) => {
//     res.status(200).render('base', {
//         tour:'forest hiker',
//         user:'dharmik'
//     })
// }

const Tour = require("../models/tourModel")
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")


exports.getTour = catchAsync(async (req,res,next) => {
    const newTour = await Tour.findOne({slug:req.params.tourSlug}).populate({
        path:'reviews',
        // fields:'review user rating'
    })
    if(!newTour){
        return next(new AppError("Unable to find this tour", 404))
    }

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

exports.accountPage = catchAsync(async (req,res,next) => {
    res.status(200).render('account', {
        title:"Your Account"
     })
})

exports.updateUserData = catchAsync(async (req,res,next) => {
    console.log('updating user:' , req.body)
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name:req.body.name,
        email:req.body.email
    }, {
        new:true,
        runValidators:true
    })
    // res.locals.user = updatedUser
    res.status(200).render('account', {
        title:'Your Account',
        user:updatedUser
    })
})