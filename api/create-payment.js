// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set the CORS headers to allow requests from your Android app's WebView
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle a GET request for a Connection Token
  if (req.method === 'GET') {
    try {
      // Create a Connection Token for the Android app
      const token = await stripe.terminal.connectionTokens.create();
      res.json({ secret: token.secret });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Handle a POST request to create a Payment Intent
  if (req.method === 'POST') {
    try {
      // Get amount and metadata from the request body
      const { amount, metadata } = req.body;
      const amountInCents = Math.round(Number(amount) * 100);

      // Create a PaymentIntent with the amount, currency, and metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'aud',
        payment_method_types: ['card_present'],
        capture_method: 'manual', // Use manual capture for card-present payments
        metadata: metadata, // Pass the giving details as metadata
      });

      // Send back the client secret
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};
