import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/constants';

const ProfileInfo = ({
    userName,
    userBio,
    isEditing,
    onUserNameChange,
    onUserBioChange
}) => {
    return (
        <View style={styles.profileInfo}>
            {isEditing ? (
                <TextInput
                    style={styles.userNameInput}
                    value={userName}
                    onChangeText={onUserNameChange}
                    autoFocus
                />
            ) : (
                <Text style={styles.userName}>{userName}</Text>
            )}
            {isEditing ? (
                <TextInput
                    style={styles.userBioInput}
                    value={userBio}
                    onChangeText={onUserBioChange}
                    multiline
                    numberOfLines={3}
                />
            ) : (
                <Text style={styles.userBio} numberOfLines={3} ellipsizeMode='tail'>
                    {userBio}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 70,
    },
    userName: {
        color: COLORS.light,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userNameInput: {
        color: COLORS.light,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.light,
        width: '80%',
        textAlign: 'center',
        paddingVertical: 5,
    },
    userBio: {
        color: COLORS.text,
        fontSize: 16,
        textAlign: 'center',
    },
    userBioInput: {
        color: COLORS.text,
        fontSize: 16,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.text,
        width: '80%',
        paddingVertical: 5,
        minHeight: 60,
    },
});

export default ProfileInfo;