import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { useTheme } from '../context/ThemeContext';
import { RADII } from '../constants/constants';
import stripeService from '../services/stripeService';

const StripePayment = ({
    plan,
    customerId,
    onPaymentSuccess,
    onPaymentFailure,
    onCancel
}) => {
    const { colors } = useTheme();
    const { confirmPayment, loading } = useStripe();
    const [cardDetails, setCardDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!cardDetails?.complete) {
            Alert.alert('Error', 'Please complete card details');
            return;
        }

        if (!customerId) {
            Alert.alert('Error', 'Customer ID is required');
            return;
        }

        setIsProcessing(true);

        try {
            // Create payment intent
            const clientSecret = await stripeService.createPaymentIntent(
                plan.id,
                customerId
            );

            // Confirm payment
            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
                paymentMethodData: {
                    billingDetails: {
                        email: 'customer@example.com', // Get from user context
                    },
                },
            });

            if (error) {
                stripeService.handlePaymentFailure(error);
                onPaymentFailure?.(error);
            } else if (paymentIntent) {
                // Create subscription after successful payment
                try {
                    const subscriptionId = await stripeService.createSubscription(
                        customerId,
                        plan.id
                    );

                    stripeService.handlePaymentSuccess(subscriptionId, plan.name);
                    onPaymentSuccess?.(subscriptionId, plan);
                } catch (subscriptionError) {
                    console.error('Error creating subscription:', subscriptionError);
                    Alert.alert(
                        'Payment Successful',
                        'Payment was processed but there was an issue activating your subscription. Please contact support.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            stripeService.handlePaymentFailure(error);
            onPaymentFailure?.(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                Complete Payment
            </Text>

            <Text style={[styles.planInfo, { color: colors.textSecondary }]}>
                {plan.name} Plan - {plan.price} {plan.currency}/{plan.interval}
            </Text>

            <View style={[styles.cardContainer, { backgroundColor: colors.glass }]}>
                <CardField
                    postalCodeEnabled={false}
                    placeholder={{
                        number: '4242 4242 4242 4242',
                    }}
                    cardStyle={{
                        backgroundColor: colors.surface,
                        textColor: colors.text,
                        borderColor: colors.border,
                        borderWidth: 1,
                        borderRadius: RADII.small,
                    }}
                    style={styles.cardField}
                    onCardChange={(cardDetails) => {
                        setCardDetails(cardDetails);
                    }}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={onCancel}
                    disabled={isProcessing}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                        Cancel
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.payButton,
                        { backgroundColor: colors.primary },
                        isProcessing && { opacity: 0.6 }
                    ]}
                    onPress={handlePayment}
                    disabled={isProcessing || !cardDetails?.complete}
                >
                    <Text style={[styles.payButtonText, { color: colors.surface }]}>
                        {isProcessing ? 'Processing...' : `Pay ${plan.price} ${plan.currency}`}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                Your payment is secure and encrypted. You will be charged monthly for this subscription.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: RADII.rounded,
        margin: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    planInfo: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
    cardContainer: {
        padding: 15,
        borderRadius: RADII.rounded,
        marginBottom: 20,
    },
    cardField: {
        width: '100%',
        height: 50,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: RADII.rounded,
        padding: 15,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    payButton: {
        flex: 2,
        borderRadius: RADII.rounded,
        padding: 15,
        alignItems: 'center',
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        opacity: 0.8,
    },
});

export default StripePayment;
