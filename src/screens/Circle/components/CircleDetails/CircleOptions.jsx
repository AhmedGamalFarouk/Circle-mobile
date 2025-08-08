import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { COLORS, RADII, SHADOWS } from '../../../../constants/constants';

const CircleOptions = ({ circleId, circle, navigation }) => {
    const { colors } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [muteCircle, setMuteCircle] = useState(false);
    const styles = getStyles(colors);

    const handleLeaveCircle = () => {
        Alert.alert(
            "Leave Circle",
            `Are you sure you want to leave "${circle.name}"? You won't be able to see messages or participate in polls.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    onPress: () => {
                        console.log(`Leaving circle ${circleId}`);
                        navigation.goBack();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleClearChat = () => {
        Alert.alert(
            "Clear Chat History",
            "This will clear all chat messages for you only. Other members will still see the messages. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    onPress: () => console.log(`Clearing chat for circle ${circleId}`),
                    style: "destructive"
                }
            ]
        );
    };

    const handleEditCircle = () => {
        navigation.navigate('EditCircle', { circleId, circle });
    };

    const handleReportCircle = () => {
        Alert.alert(
            "Report Circle",
            "What would you like to report about this circle?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Inappropriate Content", onPress: () => console.log('Reporting inappropriate content') },
                { text: "Spam", onPress: () => console.log('Reporting spam') },
                { text: "Other", onPress: () => console.log('Reporting other') },
            ]
        );
    };

    const settingsOptions = [
        {
            title: 'Push Notifications',
            subtitle: 'Get notified about new messages',
            type: 'switch',
            value: notificationsEnabled,
            onValueChange: setNotificationsEnabled,
            icon: '🔔',
        },
        {
            title: 'Mute Circle',
            subtitle: 'Stop receiving notifications temporarily',
            type: 'switch',
            value: muteCircle,
            onValueChange: setMuteCircle,
            icon: '🔇',
        },
    ];

    const actionOptions = [
        {
            title: 'Edit Circle',
            subtitle: 'Change name, description, or image',
            onPress: handleEditCircle,
            icon: '✏️',
            color: colors.text,
        },
        {
            title: 'Clear Chat History',
            subtitle: 'Remove all messages for you only',
            onPress: handleClearChat,
            icon: '🗑️',
            color: colors.textSecondary,
        },
        {
            title: 'Report Circle',
            subtitle: 'Report inappropriate content',
            onPress: handleReportCircle,
            icon: '⚠️',
            color: '#FF9500',
        },
        {
            title: 'Leave Circle',
            subtitle: 'You will no longer receive messages',
            onPress: handleLeaveCircle,
            icon: '🚪',
            color: '#FF3B30',
        },
    ];

    const renderSettingItem = (item, index) => (
        <View key={index} style={styles.optionItem}>
            <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={item.value ? 'white' : colors.textSecondary}
            />
        </View>
    );

    const renderActionItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: item.color }]}>
                        {item.title}
                    </Text>
                    <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Text style={[styles.chevron, { color: item.color }]}>›</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.optionsCard}>
                    {settingsOptions.map(renderSettingItem)}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.optionsCard}>
                    {actionOptions.map(renderActionItem)}
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 8,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    optionsCard: {
        backgroundColor: colors.card,
        borderRadius: RADII.rounded,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    chevron: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default CircleOptions;