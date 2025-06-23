// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const User = require('../../models/user.model');
// const Role = require('../../models/role.model');

// const handleStripeWebhook = async (req, res) => {
//   const signature = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('❌ Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'payment_intent.succeeded') {
//     const paymentIntent = event.data.object;
//     const metadata = paymentIntent.metadata || {};

//     const userId = metadata.userId;
//     const upgradeTo = metadata.upgradeTo?.toUpperCase();

//     if (!userId || !upgradeTo) {
//       return res.status(400).send('Missing metadata: userId or upgradeTo');
//     }

//     const allowedRoles = ['PAID_USER', 'ENTERPRISE_USER'];
//     if (!allowedRoles.includes(upgradeTo)) {
//       return res.status(400).send('Invalid role upgrade requested.');
//     }

//     try {
//       const role = await Role.findOne({ name: upgradeTo });
//       if (!role) return res.status(404).send(`Role "${upgradeTo}" not found`);

//       const user = await User.findById(userId);
//       if (!user) return res.status(404).send('User not found');

//       user.role = role._id;
//       await user.save();

//       console.log(`✅ User ${user.email} upgraded to ${upgradeTo}`);
//     } catch (err) {
//       console.error('Error upgrading user role:', err);
//       return res.status(500).send('Internal error processing webhook');
//     }
//   }

//   res.json({ received: true });
// };

// module.exports = { handleStripeWebhook };
