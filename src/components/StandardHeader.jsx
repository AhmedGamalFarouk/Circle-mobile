import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const StandardHeader = ({
    title,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    showBackButton = false,
    navigation
}) => {
    const { colors } = useTheme();

    const handleBackPress = () => {
        if (navigation) {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.leftContainer}>
                    {showBackButton ? (
                        <TouchableOpacity onPress={onLeftPress || handleBackPress} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ) : leftIcon ? (
                        <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                            <Ionicons name={leftIcon} size={24} color={colors.text} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.centerContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                </View>

                <View style={styles.rightContainer}>
                    {rightIcon && (
                        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                            <Ionicons name={rightIcon} size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    leftContainer: {
        width: 44, // Same width as icon container for balance
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightContainer: {
        width: 44,
        alignItems: 'flex-end',
    },
    iconButton: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default StandardHeader;