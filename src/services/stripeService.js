import { Alert } from 'react-native';
import { STRIPE_CONFIG } from '../config/stripe';

class StripeService {
    constructor() {
        this.baseURL = STRIPE_CONFIG.BACKEND_URL;
    }

    // Initialize payment intent for subscription
    async createPaymentIntent(planId, customerId) {
        try {
            const response = await fetch(`${this.baseURL}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
                },
                body: JSON.stringify({
                    planId,
                    customerId,
                    currency: 'egp',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const data = await response.json();
            return data.clientSecret;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    // Create a customer in Stripe
    async createCustomer(email, name) {
        try {
            const response = await fetch(`${this.baseURL}/create-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
                },
                body: JSON.stringify({
                    email,
                    name,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create customer');
            }

            const data = await response.json();
            return data.customerId;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    // Create a subscription
    async createSubscription(customerId, priceId) {
        try {
            const response = await fetch(`${this.baseURL}/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
                },
                body: JSON.stringify({
                    customerId,
                    priceId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create subscription');
            }

            const data = await response.json();
            return data.subscriptionId;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    // Cancel a subscription
    async cancelSubscription(subscriptionId) {
        try {
            const response = await fetch(`${this.baseURL}/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
                },
                body: JSON.stringify({
                    subscriptionId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error canceling subscription:', error);
            throw error;
        }
    }

    // Get customer's active subscriptions
    async getCustomerSubscriptions(customerId) {
        try {
            const response = await fetch(`${this.baseURL}/customer-subscriptions/${customerId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get subscriptions');
            }

            const data = await response.json();
            return data.subscriptions;
        } catch (error) {
            console.error('Error getting subscriptions:', error);
            throw error;
        }
    }

    // Handle payment success
    handlePaymentSuccess(subscriptionId, planName) {
        Alert.alert(
            'Payment Successful!',
            `Your ${planName} subscription has been activated.`,
            [{ text: 'OK' }]
        );
    }

    // Handle payment failure
    handlePaymentFailure(error) {
        Alert.alert(
            'Payment Failed',
            'There was an issue processing your payment. Please try again.',
            [{ text: 'OK' }]
        );
        console.error('Payment error:', error);
    }
}

export default new StripeService();
