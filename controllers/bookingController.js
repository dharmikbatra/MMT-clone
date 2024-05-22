const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


exports.getCheckoutSession = catchAsync(async (req,res,next) => {
    const tour = await Tour.findById(req.params.tourID)

    // create checkout session
    const session = await stripe.checkout.sessions.create({
        // payment_method_types:['card'],
        mode:'payment',
        success_url:`${req.protocol}://${req.get('host')}/`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id:req.params.tourID,
        line_items:[
            {
                // name:`${tour.name} Tour`,
                // description:tour.summary,
                // images:['https://www.punjabkingsipl.in/static-assets/waf-images/22/c2/03/16-9/GGSAYc9lud.png'],
                price_data:{
                    currency:'inr',
                    unit_amount:tour.price*100,
                    product_data:{
                        name:`${tour.name} Tour`,
                        description:tour.summary,
                        images:['https://www.punjabkingsipl.in/static-assets/waf-images/22/c2/03/16-9/GGSAYc9lud.png']
                    }
                },
                quantity:1
            }
        ]
    })

    // create session as response
    res.status(200).json({
        status:'success',
        session
    })


})