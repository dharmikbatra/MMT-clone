const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')
const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, 'A tour mush have a name'],
        unique:true,
        trim:true,
        maxLength:[40,"char should be less than 40"],
        minLength:[10,"char should be more than 10"],
        // validate:[validator.isAlpha,'tour name should be alphabets only']
    },
    slug:{type:String},
    duration:{
        type:Number,
        required:[true, "Duration is must"]
    },
    maxGroupSize:{
        type:Number,
        required:[true, "size is must, obv"]
    },
    difficulty:{
        type:String,
        required:[true,"diff is must"],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty can be only 3 values'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        max:[5,"max r is 5"],
        min:[1,"min r is 1"],
        set: val => Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true, 'Price is must']
    },
    priceDiscount: {
        type:Number,
        validate:{
            validator:function(val){
                return val<this.price
            },
            message:'discount ({VALUE}) not more than the price' // {VALUE} has the access 
    }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,"must"]
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true, "image is must"]
    },
    images:{
        type:[String]
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    startDates:{
        type:[Date]
    },
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation : {
        //geoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates: [Number],  // latitude and longitude
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.index({price:1, ratingsAverage:-1}) // 1and -1 for ascending descending
tourSchema.index({slug:1})
tourSchema.index({startLocation:['2dsphere']})


tourSchema.virtual('durationWeeks').get(function() {  // virtual field, iske liye hi virtuals:true kara hai
    return this.duration / 7
})

// virtual populate
tourSchema.virtual('reviews', {
    ref:'Review',
    foreignField:'tour',  // jis field pe hum Review(ref) mein objectId store karre hain current(Tour) ki
    localField:'_id'
})


//document middleware runs before save and create functions only, not like insertMany
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next()
})


// This was for embedding the users into the tours
tourSchema.pre('save', async function(next){
    const guidesPromise = this.guides.map(async id => await User.findById(id))
    this.guides = await Promise.all(guidesPromise)
    next()
})

tourSchema.pre('save', function(next){
    console.log("second pre")
    next()
})
tourSchema.post('save', function(doc, next){
    console.log(doc)
    next()
})

//query middleware
tourSchema.pre(/^find/, function(next){  // regex for all fxns starting with find
    this.find({secretTour:{$ne:true}})
    this.start = Date.now()
    next()
})


tourSchema.pre(/^find/, function(next){
    this.populate({ // alag query hogi proper to performance will go a bit down, but we saved some storage
        path:'guides',
        select:'-__v -passwordChangedAt'
    })
    next()
})
tourSchema.post(/^find/, function(doc, next){
    // console.log(doc)
    console.log(`query took: ${Date.now() - this.start}`)
    next()
})

//aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({
//         $match:{secretTour:{$ne:true}}
//     })
//     next()
// })


const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;
