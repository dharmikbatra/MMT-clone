import { showAlert } from "./alerts"
// import {loadStripe} from '@stripe/stripe-js';
// const stripe = require('stripe')('pk_test_51PIo0KSGDoMzePPsePZLpU13YE0FA47B58s4vFDX7JDgpEglRh7zftKJ8JJWkQVjFlejlrlrBGlalFhQpKjas3IH00ueqLS1ep')

const stripe = Stripe('pk_test_51PIo0KSGDoMzePPsePZLpU13YE0FA47B58s4vFDX7JDgpEglRh7zftKJ8JJWkQVjFlejlrlrBGlalFhQpKjas3IH00ueqLS1ep')
// const stripe = require("stripe-client")(
    // const stripe = new Stripe(
//         const stripe = loadStripe(
//     "pk_test_51PIo0KSGDoMzePPsePZLpU13YE0FA47B58s4vFDX7JDgpEglRh7zftKJ8JJWkQVjFlejlrlrBGlalFhQpKjas3IH00ueqLS1ep"
//   );


export const bookTour = async tourID => {
    // get session from server
    try{
        const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`)
        // console.log(session.data.session)

        // create checkout form + charge credit card
        return await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
        // location.assign(session.data.session.url)
        // console.log("hello")

    }catch(err){
        // console.log(err)
        showAlert(err)
    }
}