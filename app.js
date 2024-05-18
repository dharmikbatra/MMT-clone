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
const viewRouter = require('./routes/viewRoutes')
const { whitelist } = require('validator')
const path = require('path')
var cors= require('cors');
const cookieParser = require('cookie-parser')
const app = express()

// for map functionality in the wesite
const scriptSrcUrls = ['https://unpkg.com/',
    'https://tile.openstreetmap.org'];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/'
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
 
//set security http headers

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


// for serving static files
app.use(express.static(path.join(__dirname, 'public')))

// GLOBAL MIDDLEWARE
// security middleware, which includes 14 small security middlewares
// which sets HTTP response headers, some are on some are off
// app.use(helmet())

app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'", 'http://127.0.0.1:3000','http://localhost:3000','ws://localhost:63838/', ...connectSrcUrls],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.8/axios.min.js", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
        fontSrc: ["'self'", 'https:', 'data:', ...fontSrcUrls],
        upgradeInsecureRequests: [],
      }
    })
  );

app.use(cors());
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
app.use(express.urlencoded({extended:true, limit:'10kb'}))

app.use(cookieParser())

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
    console.log(req.cookies)
    next();
})

//for frontend


// api 
app.use('/api/v1/tours' , tourRouter)
app.use('/api/v1/users' , userRouter)
app.use('/api/v1/reviews', reviewRouter)


app.use('/', viewRouter)

app.all('*',(req,res,next)=>{
    console.log(req.originalUrl)
    next(new AppError('galat end point', 404))
})

app.use(globalErrorHandler)



module.exports = app;