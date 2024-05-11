const express = require('express')
const morgan = require('morgan')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit =  require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require('express-mongo-sanitize')
const xss= require('xss-clean')
const hpp = require("hpp")
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter= require('./routes/reviewRoutes')
const { whitelist } = require('validator')
const app = express()

// GLOBAL MIDDLEWARE
// security middleware, which includes 14 small security middlewares
// which sets HTTP response headers, some are on some are off
app.use(helmet())


if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// limit requests from same IP
const limiter = rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message:'Too many requests from the same IP, please try again in an hour'
})
app.use('/api', limiter)

// Body parser, to read data from body to req.body
app.use(express.json({
    limit:'10kb'
}));

// data sanitisation against NOSQL query injection
app.use(mongoSanitize()) // filters $ and . to avoid tricks to get db access

// Data sanitisation against XXS
app.use(xss({
    whitelist:['duration','ratingsQuantity', 'maxGroupSize', 'price', 'difficulty', 'ratingsAverage'] // allowing multiple values for these get params
})) // fxn ko string kardega ke execute na ho paaye

app.use(hpp())  // clear the query string
// test middleware
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
    next();
})

app.use('/api/v1/tours' , tourRouter)
app.use('/api/v1/users' , userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.all('*',(req,res,next)=>{
    next(new AppError('galat end point', 404))
    // const err = new Error('galat end point')
    // err.status = 'fail'
    // err.statusCode = 404

    // next(err)      // whenever we pass anything in ou next fxn, its assumed to be error only !!
    // res.status(404).json({
    //     status:"failure",
    //     message:`hello ji, galat end point ${req.originalUrl}`
    // })
})

app.use(globalErrorHandler)



module.exports = app;