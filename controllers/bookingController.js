const Booking = require("../models/bookingModel")
const Tour = require("../models/tourModel")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const Email = require("../utils/email")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req,res,next) => {
    const tour = await Tour.findById(req.params.tourID)

    // create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode:'payment',
        success_url:`${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourID
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id:req.params.tourID,
        line_items:[
            {
                quantity:1,
                price_data:{
                    currency:'inr',
                    unit_amount:tour.price*100,
                    product_data:{
                        name:`${tour.name} Tour`,
                        description:tour.summary,
                        images:['https://www.punjabkingsipl.in/static-assets/waf-images/22/c2/03/16-9/GGSAYc9lud.png']
                    }
                }
            }
        ]
    })
    // console.log(session)

    // create session as response
    res.status(200).json({
        status:'success',
        session
    })


})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const {tour , user, price} = req.query;
    // console.log(req.query)

    if(!tour && !user && !price){return next()}

    await Booking.create({tour,user,price})
    const newUser = await User.findById(user)
    const newTour = await Tour.findById(tour)
    await new Email(newUser, `localhost:3000/tour/${newTour.slug}`).sendBookedTour()
    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
exports.updateBooking = factory.updateOne(Booking)
