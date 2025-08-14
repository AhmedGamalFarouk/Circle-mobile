import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_CONFIG } from '../config/stripe';

const AppStripeProvider = ({ children }) => {
    return (
        <StripeProvider
            publishableKey={STRIPE_CONFIG.PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.circle.mobile" // Replace with your merchant identifier
            urlScheme="circle-mobile" // Replace with your app's URL scheme
        >
            {children}
        </StripeProvider>
    );
};

export default AppStripeProvider;
