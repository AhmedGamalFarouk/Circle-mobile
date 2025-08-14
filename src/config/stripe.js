// Stripe Configuration
// Replace these with your actual Stripe keys
export const STRIPE_CONFIG = {
    // For testing, use test keys that start with pk_test_
    // For production, use live keys that start with pk_live_
    PUBLISHABLE_KEY: 'pk_test_your_publishable_key_here',
    SECRET_KEY: 'sk_test_your_secret_key_here',

    // Stripe API endpoints
    API_BASE_URL: 'https://api.stripe.com/v1',

    // Your backend API endpoint for creating payment intents
    BACKEND_URL: 'https://your-backend-api.com/api',
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
    FREE: {
        id: 'price_free',
        name: 'Free',
        price: 0,
        currency: 'EGP',
        interval: 'month',
        features: {
            connections: 5,
            circles: 3,
            createCircle: 1,
            members: 5,
        }
    },
    SILVER: {
        id: 'price_silver_monthly', // Replace with your actual Stripe price ID
        name: 'Silver',
        price: 10,
        currency: 'EGP',
        interval: 'month',
        features: {
            connections: 15,
            circles: 5,
            createCircle: 3,
            members: 30,
        }
    },
    GOLDEN: {
        id: 'price_golden_monthly', // Replace with your actual Stripe price ID
        name: 'Golden',
        price: 50,
        currency: 'EGP',
        interval: 'month',
        features: {
            connections: 'Unlimited',
            circles: 'Unlimited',
            createCircle: 'Unlimited',
            members: 'Unlimited',
        }
    }
};
