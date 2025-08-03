import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RADII } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

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

    const handlePlanSelect = (planName) => {
        setSelectedPlan(planName);
        // Here you can add logic to handle plan selection (API call, etc.)
        console.log(`Selected plan: ${planName}`);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>My Plan</Text>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
        opacity: 0.8,
    },
    planContainer: {
        borderWidth: 1,
        borderRadius: RADII.rounded,
        padding: 20,
        marginBottom: 15,
        // ...SHADOWS.card,
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