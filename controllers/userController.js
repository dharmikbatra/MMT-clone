const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//     destination:(req,file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename:(req,file,cb) => {
//         //user-id-timestamp.jpeg
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

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
    // console.log(req.file)
    // console.log(req.body)
    // create error if user posts password data
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError("Password can't be modified using this functionality", 400))
    }

    //update user document
    const filteredBody = filterObject(req.body, 'name', 'email');
    if (req.file){filteredBody.photo = req.file.filename}
    // varna koi bhi aake kuch bhi change kar dega like role, expiry time and all
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody ,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status:"success",
        data:user
    })
})

exports.deleteMe = catchAsync(async (req,res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active:false})

    res.status(204).json({
        status:'success',
        data:null
    })
})


exports.uploadUserPhoto = upload.single('photo')
exports.resizeUserPhoto =  catchAsync(async (req,res,next) => {
    if(!req.file){return next()}

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`)
    
    next()
})