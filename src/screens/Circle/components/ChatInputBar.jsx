import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Keyboard,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import useAuth from "../../../hooks/useAuth";
import { COLORS, RADII } from "../../../constants/constants";
import useUserProfile from "../../../hooks/useUserProfile";

const ChatInputBar = ({ circleId, replyingTo, onCancelReply }) => {
    const [message, setMessage] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);
    const textInputRef = useRef(null);
    const insets = useSafeAreaInsets();

    // Auto-focus when replying
    useEffect(() => {
        if (replyingTo && textInputRef.current) {
            textInputRef.current.focus();
        }
    }, [replyingTo]);

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
            // Keep focus on input after sending
            textInputRef.current?.focus();
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {replyingTo && (
                <View style={styles.replyingToContainer}>
                    <View style={styles.replyingToContent}>
                        <Text style={styles.replyingToUser}>{replyingTo.user.userName}</Text>
                        <Text style={styles.replyingToText} numberOfLines={1}>{replyingTo.text}</Text>
                    </View>
                    <TouchableOpacity onPress={onCancelReply}>
                        <Text style={styles.cancelReply}>×</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.container}>
                <TouchableOpacity style={styles.plusButton}>
                    <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
                <TextInput
                    ref={textInputRef}
                    style={[styles.input, { height: Math.max(40, inputHeight) }]}
                    placeholder="Type your message"
                    placeholderTextColor={COLORS.text}
                    value={message}
                    onChangeText={setMessage}
                    multiline={true}
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                    onContentSizeChange={(event) => {
                        setInputHeight(event.nativeEvent.contentSize.height);
                    }}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !message.trim() && styles.disabledButton]}
                    disabled={!message.trim()}
                    onPress={handleSend}
                >
                    <Text style={[styles.sendText, !message.trim() && styles.disabledText]}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: COLORS.dark,
        borderTopWidth: 1,
        borderTopColor: COLORS.glass,
    },
    replyingToContainer: {
        backgroundColor: COLORS.darker,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    replyingToContent: {
        flex: 1,
    },
    replyingToUser: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 2,
    },
    replyingToText: {
        color: COLORS.text,
        fontSize: 14,
    },
    cancelReply: {
        color: COLORS.text,
        fontSize: 20,
        marginLeft: 15,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: COLORS.dark,
    },
    plusButton: {
        padding: 8,
        marginBottom: 2,
    },
    plusText: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: "300",
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: COLORS.darker,
        borderRadius: RADII.pill,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: COLORS.light,
        marginHorizontal: 10,
        fontSize: 16,
        textAlignVertical: Platform.OS === 'android' ? 'top' : 'center',
    },
    sendButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 2,
    },
    sendText: {
        color: COLORS.primary,
        fontWeight: "600",
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: COLORS.text,
    },
});

export default ChatInputBar;