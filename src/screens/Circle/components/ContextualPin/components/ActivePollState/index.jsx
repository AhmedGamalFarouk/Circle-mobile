import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const ActivePollState = ({ data, onVote }) => {
    const { poll, currentUser } = data;
    const userVoted = poll.voters.some(voter => voter.id === currentUser.id);

    return (
        <View style={styles.container}>
            <Text style={styles.pollCreator}>Poll by {poll.creator.name} • Ends in {poll.endsIn}</Text>
            <Text style={styles.pollQuestion}>{poll.question}</Text>
            {poll.options.map(option => (
                <View key={option.id}>
                    {userVoted ? (
                        <View style={styles.votedOptionContainer}>
                            <View style={[styles.progressBar, { width: `${(option.votes / poll.voters.length) * 100}%`, backgroundColor: option.id === currentUser.votedFor ? COLORS.primary : COLORS.grey }]} />
                            <Text style={styles.votedOptionText}>{option.text}</Text>
                            {option.id === currentUser.votedFor && <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/30/ffffff/checkmark.png' }} style={styles.checkmark} />}
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.optionContainer} onPress={() => onVote(option.id)}>
                            <View style={styles.circle} />
                            <Text style={styles.optionText}>{option.text}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
            {userVoted && (
                <View style={styles.votersContainer}>
                    {poll.voters.map(voter => (
                        <Image key={voter.id} source={{ uri: voter.profilePic }} style={styles.voterImage} />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
        padding: 20,
        width: '100%',
    },
    pollCreator: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 12,
        marginBottom: 10,
    },
    pollQuestion: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 20,
        marginBottom: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: 15,
    },
    optionText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
    votedOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        position: 'relative',
        backgroundColor: COLORS.lightGrey,
        borderRadius: 5,
        padding: 10,
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 5,
    },
    votedOptionText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
    checkmark: {
        width: 20,
        height: 20,
        marginLeft: 'auto',
    },
    votersContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    voterImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: -10,
        borderWidth: 2,
        borderColor: COLORS.dark,
    },
});

export default ActivePollState;