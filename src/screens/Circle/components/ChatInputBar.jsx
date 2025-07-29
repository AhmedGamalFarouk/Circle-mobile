import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import useAuth from "../../../hooks/useAuth";
import { COLORS, RADII } from "../../../constants/constants";
import useUserProfile from "../../../hooks/useUserProfile";

const ChatInputBar = ({ circleId }) => {
    const [message, setMessage] = useState("");
    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);

    const handleSend = async () => {
        if (message.trim() === "" || !userProfile) return;

        const messageData = {
            text: message,
            createdAt: serverTimestamp(),
            user: {
                userId: user.uid,
                userName: userProfile.username,
                imageurl: userProfile.profileImage,
            },
        };


        try {
            await addDoc(collection(db, "circles", circleId, "chat"), messageData);
            setMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.plusButton}>
                <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Type your message"
                placeholderTextColor={COLORS.text}
                value={message}
                onChangeText={setMessage}
            />
            <TouchableOpacity
                style={[styles.sendButton, !message && styles.disabledButton]}
                disabled={!message}
                onPress={handleSend}
            >
                <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: COLORS.dark,
        borderTopWidth: 1,
        borderTopColor: COLORS.glass,
    },
    plusButton: {
        padding: 10,
    },
    plusText: {
        color: COLORS.primary,
        fontSize: 24,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: COLORS.darker,
        borderRadius: RADII.pill,
        paddingHorizontal: 15,
        color: COLORS.light,
        marginHorizontal: 10,
    },
    sendButton: {
        padding: 10,
    },
    sendText: {
        color: COLORS.primary,
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default ChatInputBar;