import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { RADII } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';
import { SUBSCRIPTION_PLANS } from '../../../config/stripe';
import StripePayment from '../../../components/StripePayment';
import stripeService from '../../../services/stripeService';

const plans = [
    {
        name: 'Free',
        connections: 5,
        circles: 3,
        createCircle: 1,
        members: 5,
        price: '0 EGP/month',
    },
    {
        name: 'Silver',
        connections: 15,
        circles: 5,
        createCircle: 3,
        members: 30,
        price: '10 EGP/month',
    },
    {
        name: 'Golden',
        connections: 'Unlimited',
        circles: 'Unlimited',
        createCircle: 'Unlimited',
        members: 'Unlimited',
        price: '50 EGP/month',
    },
];

const MyPlan = () => {
    const { colors } = useTheme();
    const [selectedPlan, setSelectedPlan] = useState('Free');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
    const [customerId, setCustomerId] = useState('customer_123'); // Replace with actual user's customer ID

    const handlePlanSelect = (planName) => {
        setSelectedPlan(planName);

        // If it's not the Free plan, show payment modal
        if (planName !== 'Free') {
            const plan = SUBSCRIPTION_PLANS[planName.toUpperCase()];
            if (plan) {
                setSelectedPlanForPayment(plan);
                setShowPaymentModal(true);
            }
        }
    };

    const handlePaymentSuccess = (subscriptionId, plan) => {
        setSelectedPlan(plan.name);
        setShowPaymentModal(false);
        Alert.alert(
            'Subscription Activated!',
            `Your ${plan.name} plan is now active.`,
            [{ text: 'OK' }]
        );
    };

    const handlePaymentFailure = (error) => {
        console.error('Payment failed:', error);
        setShowPaymentModal(false);
    };

    const handleCancelPayment = () => {
        setShowPaymentModal(false);
        setSelectedPlanForPayment(null);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.primary }]}>My Plan</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose the plan that fits your needs</Text>
            {plans.map((plan, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.planContainer,
                        {
                            backgroundColor: colors.glass,
                            borderColor: colors.border
                        },
                        selectedPlan === plan.name && [
                            styles.selectedPlan,
                            {
                                borderColor: colors.primary,
                                backgroundColor: colors.primary + '10'
                            }
                        ]
                    ]}
                    onPress={() => handlePlanSelect(plan.name)}
                >
                    <View style={styles.planHeader}>
                        <Text style={[
                            styles.planName,
                            { color: colors.text },
                            selectedPlan === plan.name && [styles.selectedPlanName, { color: colors.primary }]
                        ]}>
                            {plan.name}
                        </Text>
                        {selectedPlan === plan.name && (
                            <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                                <Text style={[styles.selectedBadgeText, { color: colors.surface }]}>Current</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.featuresContainer}>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>• {plan.connections} connections</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>• Join {plan.circles} circles</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>• Create {plan.createCircle} circle{plan.createCircle !== 1 ? 's' : ''}</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>• Up to {plan.members} members per circle</Text>
                    </View>

                    <Text style={[
                        styles.price,
                        { color: colors.accent },
                        selectedPlan === plan.name && [styles.selectedPrice, { color: colors.primary }]
                    ]}>
                        {plan.price}
                    </Text>
                </TouchableOpacity>
            ))}

            {/* Payment Modal */}
            <Modal
                visible={showPaymentModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCancelPayment}
            >
                {selectedPlanForPayment && (
                    <StripePayment
                        plan={selectedPlanForPayment}
                        customerId={customerId}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentFailure={handlePaymentFailure}
                        onCancel={handleCancelPayment}
                    />
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
        marginLeft: 4,
    },
    planContainer: {
        borderWidth: 1,
        borderRadius: RADII.rounded,
        padding: 16,
        marginBottom: 12,
    },
    selectedPlan: {
        borderWidth: 2,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    planName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    selectedPlanName: {
        // color will be set dynamically
    },
    selectedBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADII.pill,
    },
    selectedBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    featuresContainer: {
        marginBottom: 15,
    },
    featureText: {
        fontSize: 14,
        marginBottom: 6,
        lineHeight: 20,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    selectedPrice: {
        // color will be set dynamically
    },
});

export default MyPlan;