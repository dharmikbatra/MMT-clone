const AppError = require("../utils/appError")

const handleCastErrorDB =  err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}
const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name
    const message = `Duplicate field value:${value}. Please use other value`
    return new AppError(message, 400)
}
const sendErrorDev = (err,req,res) => {
    if (req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
            error:err,
            stack:err.stack
        })
    }
    res.status(err.statusCode).render('error', {
        title:'something went wrong',
        msg:err.message
    })
}
const handleJWTError = () => {
    return new AppError('Invalid Token, login again', 500)
}
const handleJWTExpiredError = () => new AppError('token expired, please log in again', 500)
const handleValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid input Data. ${errors.join('. \n')}`
    return new AppError(message, 400)
}

const sendErrorProd = (err , req,res) => {
    // console.log(err)
    if(req.originalUrl.startsWith('/api')){
        if (err.isOperational){
            return res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            })
        }   // programming or other unknown errors
        console.error('ERROR!!!!!!!!', err)  // error will be visible on heroku(hosting) platform
        res.status(500).json({
            status:'error',
            message:'something went wrong'
        })
    }else{
        if(err.isOperational){
            res.status(err.statusCode).render('error', {
                title:'something went wrong',
                msg:err.message
            })
        }else{
            res.status(err.statusCode).render('error', {
                title:"error page",
                msg:'please try again later!'
            })
        }
    }
}

module.exports = (err, req,res, next) => {  // defining 4 parameters, itself means that express knows that its a error middleware
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    // console.log(err)


    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res)
    }else if (process.env.NODE_ENV === 'production'){

        let error = {... err}
        error.message = err.message
        if (error.name === 'CastError'){
            error = handleCastErrorDB(error)
        }
        if (error.code === 11000){
            error = handleDuplicateFieldsDB(error)
        }
        if (error.name === 'ValidatorError'){
            error = handleValidationError(error)
        }
        if (error.name === 'JsonWebTokenError'){
            error = handleJWTError()
        }
        if (error.name === 'TokenExpiredError'){
            error = handleJWTExpiredError()
        }
        sendErrorProd(error,req,res)
    }
}