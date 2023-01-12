const catchAsyncErrors = require('../middleware/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




processPayment = catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            company: "Ecommerce",
        }
    });

    res.status(200).send({ success: true, client_secret: myPayment.client_secret });
});



sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
    res.status(200).send({ stripeApiKey: process.env.STRIPE_API_KEY });
});


module.exports = { processPayment, sendStripeApiKey }