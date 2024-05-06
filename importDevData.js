const dotenv = require('dotenv')
const fs = require("fs")
const mongoose = require("mongoose")
dotenv.config()
const Tour = require("./models/tourModel")

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

const  tours = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json"))
const importData = async () => {
    try{
        await Tour.create(tours)
        
    }catch(err){
        console.log(err)
    }
    process.exit()
}

const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log("del success")
    }
    catch(err){
        console.log(err)
    }
    process.exit()
}


if (process.argv[2] === '--import'){importData();}
if (process.argv[2] === '--delete'){deleteData();}

