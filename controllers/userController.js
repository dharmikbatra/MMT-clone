const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObject = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){newObj[el] = obj[el]}
    })
    return newObj
}

exports.getAllUsers = async (req,res) => {
    const users = await User.find();
    res.status(200).json({
        status:"success",
        results:users.length,
        data:{
            users
        }
    })
}

exports.createUser = (req,res) => {
    res.status(500).json({
        status:'err',
        message:'not defined'
    })
}

exports.getUser = (req,res) => {
    res.status(500).json({
        status:'err',
        message:'not defined'
    })
}

exports.updateUser = (req,res) => {
    res.status(500).json({
        status:'err',
        message:'not defined'
    })
}

exports.deleteUser = (req,res) => {
    res.status(500).json({
        status:'err',
        message:'not defined'
    })
}

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