const dotenv = require('dotenv')
const fs = require("fs")
const mongoose = require("mongoose")
dotenv.config()
const Tour = require("./models/tourModel")
const User = require('./models/userModel')
const Review = require('./models/reviewModel')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(con => {
    console.log("DB connection Successful !")
})

// read Json file

const  tours = JSON.parse(fs.readFileSync("./dev-data/data/tours.json"))
const  users = JSON.parse(fs.readFileSync("./dev-data/data/users.json"))
const  reviews = JSON.parse(fs.readFileSync("./dev-data/data/reviews.json"))
const importData = async () => {
    try{
        await Tour.create(tours)
        await User.create(users)
        await Review.create(reviews)
        
    }catch(err){
        console.log(err)
    }
    process.exit()
}

const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await User.deleteMany()
        await Review.deleteMany()
        console.log("del success")
    }
    catch(err){
        console.log(err)
    }
    process.exit()
}


if (process.argv[2] === '--import'){importData();}
if (process.argv[2] === '--delete'){deleteData();}

