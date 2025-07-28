import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/constants';

const ProfileHeader = ({ navigation, isOwnProfile, isEditing, onSave, onEdit }) => {
    return (
        <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.light} />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
                {isOwnProfile && (
                    <>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            style={styles.iconButton}
                        >
                            <Ionicons name="settings-outline" size={24} color={COLORS.light} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={isEditing ? onSave : onEdit}>
                            <Ionicons
                                name={isEditing ? "checkmark-circle-outline" : "create-outline"}
                                size={24}
                                color={COLORS.light}
                            />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerIcons: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 1,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginRight: 15,
    },
});

export default ProfileHeader;