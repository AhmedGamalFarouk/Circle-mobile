import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS, RADII } from '../../../constants/constants';

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
    const [selectedPlan, setSelectedPlan] = useState('Free');

    const handlePlanSelect = (planName) => {
        setSelectedPlan(planName);
        // Here you can add logic to handle plan selection (API call, etc.)
        console.log(`Selected plan: ${planName}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Plan</Text>
            <Text style={styles.subtitle}>Choose the plan that fits your needs</Text>
            {plans.map((plan, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.planContainer,
                        selectedPlan === plan.name && styles.selectedPlan
                    ]}
                    onPress={() => handlePlanSelect(plan.name)}
                >
                    <View style={styles.planHeader}>
                        <Text style={[
                            styles.planName,
                            selectedPlan === plan.name && styles.selectedPlanName
                        ]}>
                            {plan.name}
                        </Text>
                        {selectedPlan === plan.name && (
                            <View style={styles.selectedBadge}>
                                <Text style={styles.selectedBadgeText}>Current</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.featuresContainer}>
                        <Text style={styles.featureText}>• {plan.connections} connections</Text>
                        <Text style={styles.featureText}>• Join {plan.circles} circles</Text>
                        <Text style={styles.featureText}>• Create {plan.createCircle} circle{plan.createCircle !== 1 ? 's' : ''}</Text>
                        <Text style={styles.featureText}>• Up to {plan.members} members per circle</Text>
                    </View>

                    <Text style={[
                        styles.price,
                        selectedPlan === plan.name && styles.selectedPrice
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
        color: COLORS.light,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 20,
        opacity: 0.8,
    },
    planContainer: {
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.text + '30',
        borderRadius: RADII.rounded,
        padding: 20,
        marginBottom: 15,
        ...SHADOWS.card,
    },
    selectedPlan: {
        borderColor: COLORS.primary,
        borderWidth: 2,
        backgroundColor: COLORS.primary + '10',
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
        color: COLORS.light,
    },
    selectedPlanName: {
        color: COLORS.primary,
    },
    selectedBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADII.pill,
    },
    selectedBadgeText: {
        color: COLORS.light,
        fontSize: 12,
        fontWeight: '600',
    },
    featuresContainer: {
        marginBottom: 15,
    },
    featureText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 6,
        lineHeight: 20,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.accent,
        textAlign: 'right',
    },
    selectedPrice: {
        color: COLORS.primary,
    },
});

export default MyPlan;