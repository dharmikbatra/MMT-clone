const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory')


const filterObject = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){newObj[el] = obj[el]}
    })
    return newObj
}


exports.createUser = (req,res) => {
    res.status(500).json({
        status:'err',
        message:'THis route is not defined, use /signup instead'
    })
}

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id
    next()
}


exports.getAllUsers = factory.getAll(User)

exports.getUser = factory.getOne(User)
/// do not update passwords with this, save middle wares won't work
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)

exports.updateMe = catchAsync(async (req,res,next) => {
    // create error if user posts password data
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError("Password can't be modified using this functionality", 400))
    }

    //update user document
    const filteredBody = filterObject(req.body, 'name', 'email');
    // varna koi bhi aake kuch bhi change kar dega like role, expiry time and all
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody ,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status:"success"
    })
})

exports.deleteMe = catchAsync(async (req,res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active:false})

    res.status(204).json({
        status:'success',
        data:null
    })
})