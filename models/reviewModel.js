//review text
// review rating
// createdAt
// ref to tour
// ref to user
const mongoose = require('mongoose')
const Tour = require('./tourModel')

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

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity:0,
            ratingsAverage:4.5
        })
    }
}

reviewSchema.post('save', function() {
    // Review.calcAverageRatings(this.tour) // but Review to yaha pe bana hi nhi hai ?????
    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne()
    // console.log(r)
    next()
})

reviewSchema.post(/^findOneAnd/, async function(next){
    // await this.findOne() // doesn't work here as query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour)
})
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review
