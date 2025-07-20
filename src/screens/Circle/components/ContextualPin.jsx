import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, RADII } from "../../../constants/constants";
import PollCard from "./PollCard";

const ContextualPin = ({ state }) => {
    if (state === 'active-poll') {
        return <PollCard />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Contextual Pin - {state}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 200,
    },
    text: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
});

export default ContextualPin;