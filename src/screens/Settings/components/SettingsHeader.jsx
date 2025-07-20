import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../../constants/constants';

const SettingsHeader = ({ navigation }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.light} />
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.placeholder} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: COLORS.dark,
    },
    backButton: {
        padding: 5,
    },
    title: {
        color: COLORS.light,
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: FONTS.heading,
    },
    placeholder: {
        width: 34, // Same width as back button for centering
    },
});

export default SettingsHeader;