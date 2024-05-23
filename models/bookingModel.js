const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true, "booking must be for one tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, "booking must be for one user"]
    },
    price:{
        type:Number,
        require:[true, "booking price is must"]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:true
    }

})

bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path:'tour',
        select:'name'
    })
    next()
})

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking