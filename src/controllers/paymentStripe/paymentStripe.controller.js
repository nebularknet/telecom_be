const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../../models/user.model');
const Role = require('../../models/role.model');

// Handle payment intent creation and webhook processing
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;
  let event;

  try {
    // Validate the webhook signature to ensure it comes from Stripe
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle webhook event for payment intent succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata || {};
    console.log('Event Type:', event.type);
    console.log('Event Data:', event.data.object);
    console.log('Payment Intent ID:', event.data.object.id);

    const userId = metadata.userId;
    const upgradeTo = metadata.upgradeTo?.toUpperCase(); // Ensure this is in uppercase

    // Check if required metadata is missing
    if (!userId || !upgradeTo) {
      return res.status(400).send('Missing metadata: userId or upgradeTo');
    }

    // Ensure the requested role upgrade is valid
    const allowedRoles = ['PAID_USER', 'ENTERPRISE_USER'];
    if (!allowedRoles.includes(upgradeTo)) {
      return res.status(400).send('Invalid role upgrade requested.');
    }

    try {
      // Find the role to upgrade the user to
      const role = await Role.findOne({ name: upgradeTo });
      if (!role) return res.status(404).send(`Role "${upgradeTo}" not found`);

      // Find the user and upgrade their role
      const user = await User.findById(userId);
      if (!user) return res.status(404).send('User not found');

      user.role = role._id;
      await user.save();

      console.log(`✅ User ${user.email} upgraded to ${upgradeTo}`);
    } catch (err) {
      console.error('Error upgrading user role:', err);
      return res.status(500).send('Internal error processing webhook');
    }
  }

  // Optional: Create Payment Intent (this should ideally be a separate function)
  const createPaymentIntent = async (user) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,  // Amount in cents (e.g., $10.00)
        currency: 'usd',
        metadata: {
          userId: user._id.toString(),
          upgradeTo: 'PAID_USER', // Role to upgrade to
        },
      });

      console.log('Payment Intent Created:', paymentIntent.id);
      return paymentIntent;
    } catch (err) {
      console.error('Error creating payment intent:', err);
      throw new Error('Error creating payment intent');
    }
  };

  // Example of creating a payment intent (you could trigger this based on other logic)
  try {
    const user = await User.findById('some-user-id'); // Fetch a user from your DB
    const paymentIntent = await createPaymentIntent(user);
    console.log('Payment Intent for User:', paymentIntent.id);
  } catch (err) {
    console.error('Error creating payment intent in webhook:', err);
  }

  // Send success response
  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
