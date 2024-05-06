

process.on('uncaughtException', err => {
    console.log("UNCAUGHT EXCEPTION")
    console.log(err.name, err.message)
    process.exit(1)
})


const dotenv = require('dotenv')
const mongoose = require("mongoose")
dotenv.config()
const app = require('./app')

// mongodb password : tVyLyo3seJ7r7T35

const port  = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(con => {
    console.log("DB connection Successful !")
})


// const testTour = new Tour({
//     name:"goa",
//     price:450,
//     rating:4.7
// })

// testTour.save().then(doc => {
//     console.log("dharmik")
//     console.log(doc)
// }).catch(err => {
//     console.log("batra")
//     console.log(err)
// })


const server = app.listen(process.env.PORT, () => {
    console.log(`app running o port ${port}`)
})

process.on('unhandledRejection', err => {
    console.log("UNHANDLED REJECTION")
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

