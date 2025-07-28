import React from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, RADII } from '../../../constants/constants';

const DraggableCard = ({ children, pan, panResponder }) => {
    const { height } = useWindowDimensions();
    const styles = getStyles(height);

    return (
        <Animated.View
            style={[
                styles.profileCard,
                {
                    marginTop: pan.y,
                },
            ]}
        >
            <View style={styles.draggableHandle} {...panResponder.panHandlers}>
                <View style={styles.dragIndicator} />
            </View>
            <View style={styles.container}>
                {children}
            </View>
        </Animated.View>
    );
};

const getStyles = (height) => StyleSheet.create({
    profileCard: {
        flex: 1,
        backgroundColor: COLORS.dark,
        borderTopLeftRadius: RADII.largeRounded,
        borderTopRightRadius: RADII.largeRounded,
        marginTop: -RADII.largeRounded,
        paddingTop: 20,
        alignItems: 'center',
        //...SHADOWS.card,
    },
    draggableHandle: {
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
        borderTopLeftRadius: RADII.largeRounded,
        borderTopRightRadius: RADII.largeRounded,
        backgroundColor: COLORS.dark,
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    dragIndicator: {
        width: 40,
        height: 5,
        backgroundColor: COLORS.text,
        borderRadius: RADII.rounded,
    },
    container: {
        flex: 1,
        width: '100%',
        marginTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
});

export default DraggableCard;