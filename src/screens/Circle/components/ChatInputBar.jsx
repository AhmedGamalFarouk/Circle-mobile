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

const ChatInputBar = ({ circleId, replyingTo, onCancelReply }) => {
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
            replyingTo: replyingTo ? {
                messageId: replyingTo.id,
                text: replyingTo.text,
                userName: replyingTo.user.userName,
            } : null,
        };


        try {
            await addDoc(collection(db, "circles", circleId, "chat"), messageData);
            setMessage("");
            if (replyingTo) {
                onCancelReply();
            }
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <View>
            {replyingTo && (
                <View style={styles.replyingToContainer}>
                    <View style={styles.replyingToContent}>
                        <Text style={styles.replyingToUser}>{replyingTo.user.userName}</Text>
                        <Text style={styles.replyingToText} numberOfLines={1}>{replyingTo.text}</Text>
                    </View>
                    <TouchableOpacity onPress={onCancelReply}>
                        <Text style={styles.cancelReply}>X</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        </View>
    );
};

const styles = StyleSheet.create({
    replyingToContainer: {
        backgroundColor: COLORS.dark,
        padding: 10,
        borderTopLeftRadius: RADII.rounded,
        borderTopRightRadius: RADII.rounded,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    replyingToContent: {
        flex: 1,
    },
    replyingToUser: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    replyingToText: {
        color: COLORS.text,
    },
    cancelReply: {
        color: COLORS.text,
        fontSize: 18,
        marginLeft: 10,
    },
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