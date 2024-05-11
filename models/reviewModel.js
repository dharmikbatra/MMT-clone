//review text
// review rating
// createdAt
// ref to tour
// ref to user
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[true, 'review cant be empty'],
        maxLength:200,
        minLength:20
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,"review must belong to a tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, "author for a review is must"]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.pre(/^find/, function(){
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     select:'name photo'
    // })
    this.populate({
        path:'user',
        select:'name photo'
    })
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review
