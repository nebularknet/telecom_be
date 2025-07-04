const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const handleStripeSubscription = async (req, res) => {
    try {
        
 // Step 1: Create a Customer
 console.log('Creating customer...');
 const customer = await stripe.customers.create({
     email,
     payment_method: paymentMethodId,
     invoice_settings: { default_payment_method: paymentMethodId },
 });

 console.log('Customer created:', customer.id);

 // Step 2: Create a Subscription
 console.log('Creating subscription for customer...');
 const subscription = await stripe.subscriptions.create({
     customer: customer.id,
     items: [{ price: priceId }],
     expand: ['latest_invoice.payment_intent'],
 });

 console.log('Subscription created:', subscription.id);

 // Send subscription details to frontend
 res.json(subscription);
} catch (error) {
 console.error('Error creating subscription:', error.message);
 res.status(500).send('Internal Server Error');
}

};

module.exports = {
    handleStripeSubscription
}