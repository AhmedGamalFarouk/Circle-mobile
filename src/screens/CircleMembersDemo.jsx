import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CircleMembersModal from '../components/CircleMembersModal';
import StandardHeader from '../components/StandardHeader';

const CircleMembersDemo = ({ navigation, route }) => {
    const { colors } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const styles = getStyles(colors);

    // You can pass a circleId from navigation params or use a default one for testing
    const circleId = route?.params?.circleId || 'demo-circle-id';

    return (
        <SafeAreaView style={styles.container}>
            <StandardHeader
                title="Circle Members Demo"
                showBackButton={true}
                navigation={navigation}
            />

            <View style={styles.content}>
                <Text style={styles.title}>Circle Members Management</Text>
                <Text style={styles.description}>
                    This demo shows the new circle members management feature with:
                </Text>

                <View style={styles.featureList}>
                    <Text style={styles.feature}>• Owner and Admin badges</Text>
                    <Text style={styles.feature}>• Context menu for member management</Text>
                    <Text style={styles.feature}>• Open Profile option for all members</Text>
                    <Text style={styles.feature}>• Remove members (admins can remove regular members)</Text>
                    <Text style={styles.feature}>• Make/remove admins (owner only)</Text>
                    <Text style={styles.feature}>• Owner cannot be managed by anyone</Text>
                </View>

                <TouchableOpacity
                    style={styles.demoButton}
                    onPress={() => setShowModal(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.demoButtonText}>Open Circle Members Modal</Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                    Note: You need to be a member of a circle to see the full functionality.
                    Tap on any member to see the context menu with available actions based on your role.
                    {'\n\n'}
                    Member avatars will display user profile images when available, with generated
                    avatar fallbacks showing the user's initials when no image is found.
                </Text>
            </View>

            <CircleMembersModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                circleId={circleId}
                navigation={navigation}
            />
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 20,
        lineHeight: 24,
    },
    featureList: {
        marginBottom: 30,
    },
    feature: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
        lineHeight: 20,
    },
    demoButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    demoButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    note: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default CircleMembersDemo;