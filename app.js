const express = require('express')
const morgan = require('morgan')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()

if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use(express.json());

app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
    next();
})

app.use('/api/v1/tours' , tourRouter)
app.use('/api/v1/users' , userRouter)
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