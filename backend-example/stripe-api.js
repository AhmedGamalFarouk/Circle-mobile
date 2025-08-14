// Backend API example for Stripe integration
// This should be implemented on your backend server (Node.js, Python, etc.)

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create a payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { planId, customerId, currency = 'egp' } = req.body;

        // Get the price from Stripe based on planId
        const price = await stripe.prices.retrieve(planId);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount,
            currency: currency,
            customer: customerId,
            metadata: {
                planId: planId,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a customer
app.post('/api/create-customer', async (req, res) => {
    try {
        const { email, name } = req.body;

        const customer = await stripe.customers.create({
            email: email,
            name: name,
        });

        res.json({
            customerId: customer.id,
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a subscription
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { customerId, priceId } = req.body;

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({
            subscriptionId: subscription.id,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel a subscription
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        res.json({
            success: true,
            subscription: subscription,
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get customer subscriptions
app.get('/api/customer-subscriptions/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
        });

        res.json({
            subscriptions: subscriptions.data,
        });
    } catch (error) {
        console.error('Error getting subscriptions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook to handle subscription events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
            const subscriptionCreated = event.data.object;
            console.log('Subscription created:', subscriptionCreated.id);
            // Update your database with subscription info
            break;
        case 'customer.subscription.updated':
            const subscriptionUpdated = event.data.object;
            console.log('Subscription updated:', subscriptionUpdated.id);
            // Update your database with subscription info
            break;
        case 'customer.subscription.deleted':
            const subscriptionDeleted = event.data.object;
            console.log('Subscription deleted:', subscriptionDeleted.id);
            // Update your database to mark subscription as inactive
            break;
        case 'invoice.payment_succeeded':
            const invoiceSucceeded = event.data.object;
            console.log('Payment succeeded:', invoiceSucceeded.id);
            // Update your database with payment info
            break;
        case 'invoice.payment_failed':
            const invoiceFailed = event.data.object;
            console.log('Payment failed:', invoiceFailed.id);
            // Handle failed payment (send email, update status, etc.)
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
