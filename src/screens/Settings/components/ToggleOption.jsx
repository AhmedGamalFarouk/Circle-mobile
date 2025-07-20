import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../constants/constants';

const ToggleOption = ({ title, description, value, onToggle }) => {
    const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const toggleBackgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.darker, COLORS.primary],
    });

    const toggleTranslateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22],
    });

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
            <TouchableOpacity onPress={() => onToggle(!value)} style={styles.toggleContainer}>
                <Animated.View style={[styles.toggleBackground, { backgroundColor: toggleBackgroundColor }]}>
                    <Animated.View
                        style={[
                            styles.toggleCircle,
                            { transform: [{ translateX: toggleTranslateX }] }
                        ]}
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    textContainer: {
        flex: 1,
        marginRight: 15,
    },
    title: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: FONTS.body,
        marginBottom: 2,
    },
    description: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.body,
        lineHeight: 18,
    },
    toggleContainer: {
        padding: 5,
    },
    toggleBackground: {
        width: 44,
        height: 24,
        borderRadius: RADII.pill,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.light,
    },
});

export default ToggleOption;