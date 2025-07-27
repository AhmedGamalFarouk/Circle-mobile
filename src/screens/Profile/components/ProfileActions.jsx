import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, RADII } from '../../../constants/constants';

const ProfileActions = ({ isFollowed, onFollow }) => {
    const { width } = useWindowDimensions();
    const styles = getStyles(width);

    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity
                style={[styles.followButton, isFollowed && { backgroundColor: COLORS.secondary }]}
                onPress={onFollow}
            >
                <Text style={styles.buttonText}>
                    {isFollowed ? 'Connected' : 'Connect'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (width) => StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        width: width * 0.8,
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    followButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: RADII.rounded,
        width: '80%',
        alignItems: 'center',
        //...SHADOWS.btnPrimary,
    },
    buttonText: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileActions;
