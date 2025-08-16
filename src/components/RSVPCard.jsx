import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { RADII, SHADOWS } from '../constants/constants';

const { width } = Dimensions.get('window');

const RSVPCard = ({
    event,
    userRsvp,
    onRsvp,
    attendees = [],
    totalRsvps = 0,
    isLoading = false
}) => {
    const { colors } = useTheme();
    const [selectedOption, setSelectedOption] = useState(userRsvp);
    const [scaleAnims] = useState({
        yes: new Animated.Value(1),
        maybe: new Animated.Value(1),
        no: new Animated.Value(1),
    });

    useEffect(() => {
        setSelectedOption(userRsvp);
    }, [userRsvp]);

    const handleRsvp = (option) => {
        if (isLoading || selectedOption === option) return;

        // Animate button press
        Animated.sequence([
            Animated.timing(scaleAnims[option], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[option], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setSelectedOption(option);
        onRsvp?.(option);
    };

    const getRsvpStats = () => {
        const stats = { yes: 0, maybe: 0, no: 0 };
        attendees.forEach(attendee => {
            if (attendee.rsvp && stats.hasOwnProperty(attendee.rsvp)) {
                stats[attendee.rsvp]++;
            }
        });
        return stats;
    };

    const getEventDate = () => {
        if (!event?.date) return 'Date TBD';

        const date = event.date.toDate ? event.date.toDate() : new Date(event.date);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderAttendeeAvatars = () => {
        const goingAttendees = attendees.filter(a => a.rsvp === 'yes').slice(0, 4);

        return (
            <View style={styles.avatarContainer}>
                {goingAttendees.map((attendee, index) => (
                    <View
                        key={attendee.id}
                        style={[
                            styles.avatar,
                            { zIndex: goingAttendees.length - index }
                        ]}
                    >
                        {attendee.avatar ? (
                            <Image source={{ uri: attendee.avatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarText}>
                                    {attendee.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
                {attendees.filter(a => a.rsvp === 'yes').length > 4 && (
                    <View style={[styles.avatar, styles.moreAvatar]}>
                        <Text style={styles.moreText}>
                            +{attendees.filter(a => a.rsvp === 'yes').length - 4}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const rsvpOptions = [
        {
            key: 'yes',
            label: 'Going',
            icon: 'checkmark-circle',
            color: colors.success,
            gradient: [colors.success, colors.success + '80'],
        },
        {
            key: 'maybe',
            label: 'Maybe',
            icon: 'help-circle',
            color: colors.warning,
            gradient: [colors.warning, colors.warning + '80'],
        },
        {
            key: 'no',
            label: 'Can\'t go',
            icon: 'close-circle',
            color: colors.error,
            gradient: [colors.error, colors.error + '80'],
        },
    ];

    const stats = getRsvpStats();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View
                style={[styles.gradientBackground, { backgroundColor: colors.surface }]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.eventIcon}>
                        <Ionicons name="calendar" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                            {event?.title || 'Event'}
                        </Text>
                        <View style={styles.eventMeta}>
                            <Ionicons name="time" size={16} color={colors.textSecondary} />
                            <Text style={styles.eventDate}>{getEventDate()}</Text>
                        </View>
                        {event?.location && (
                            <View style={styles.eventMeta}>
                                <Ionicons name="location" size={16} color={colors.textSecondary} />
                                <Text style={styles.eventLocation} numberOfLines={1}>
                                    {event.location}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* RSVP Question */}
                <View style={styles.rsvpSection}>
                    <Text style={styles.rsvpQuestion}>Will you be attending?</Text>

                    {/* RSVP Options */}
                    <View style={styles.rsvpOptions}>
                        {rsvpOptions.map((option) => {
                            const isSelected = selectedOption === option.key;

                            return (
                                <Animated.View
                                    key={option.key}
                                    style={[
                                        styles.rsvpOptionContainer,
                                        { transform: [{ scale: scaleAnims[option.key] }] }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.rsvpOption,
                                            isSelected && styles.selectedRsvpOption
                                        ]}
                                        onPress={() => handleRsvp(option.key)}
                                        disabled={isLoading}
                                    >
                                        {isSelected ? (
                                            <View
                                                style={[styles.selectedOptionGradient, { backgroundColor: option.color }]}
                                            >
                                                <Ionicons
                                                    name={option.icon}
                                                    size={20}
                                                    color={colors.background}
                                                />
                                                <Text style={styles.selectedOptionText}>
                                                    {option.label}
                                                </Text>
                                                <View style={styles.optionCount}>
                                                    <Text style={styles.optionCountText}>
                                                        {stats[option.key]}
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={styles.unselectedOption}>
                                                <Ionicons
                                                    name={option.icon + '-outline'}
                                                    size={20}
                                                    color={option.color}
                                                />
                                                <Text style={[styles.optionText, { color: option.color }]}>
                                                    {option.label}
                                                </Text>
                                                {stats[option.key] > 0 && (
                                                    <View style={[styles.optionCount, { backgroundColor: option.color + '20' }]}>
                                                        <Text style={[styles.optionCountText, { color: option.color }]}>
                                                            {stats[option.key]}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* Attendees Preview */}
                {attendees.filter(a => a.rsvp === 'yes').length > 0 && (
                    <View style={styles.attendeesSection}>
                        <View style={styles.attendeesHeader}>
                            <Text style={styles.attendeesTitle}>Going</Text>
                            <Text style={styles.attendeesCount}>
                                {attendees.filter(a => a.rsvp === 'yes').length} people
                            </Text>
                        </View>
                        {renderAttendeeAvatars()}
                    </View>
                )}

                {/* Summary */}
                <View style={styles.summary}>
                    <Text style={styles.summaryText}>
                        {totalRsvps} total response{totalRsvps !== 1 ? 's' : ''}
                    </Text>
                    {selectedOption && (
                        <View style={styles.userStatus}>
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={colors.success}
                            />
                            <Text style={styles.userStatusText}>
                                You responded: {rsvpOptions.find(o => o.key === selectedOption)?.label}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: RADII.large,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    gradientBackground: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    eventIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        lineHeight: 26,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    eventDate: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    eventLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        flex: 1,
    },
    rsvpSection: {
        marginBottom: 20,
    },
    rsvpQuestion: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    rsvpOptions: {
        gap: 12,
    },
    rsvpOptionContainer: {
        borderRadius: RADII.medium,
        overflow: 'hidden',
    },
    rsvpOption: {
        borderRadius: RADII.medium,
        overflow: 'hidden',
    },
    selectedRsvpOption: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedOptionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    selectedOptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.background,
        flex: 1,
        marginLeft: 12,
    },
    unselectedOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginLeft: 12,
    },
    optionCount: {
        minWidth: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.background + '40',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionCountText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    attendeesSection: {
        marginBottom: 16,
    },
    attendeesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    attendeesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    attendeesCount: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: -8,
        borderWidth: 2,
        borderColor: colors.background,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.background,
        fontSize: 14,
        fontWeight: 'bold',
    },
    moreAvatar: {
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    summary: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
        gap: 8,
    },
    summaryText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    userStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    userStatusText: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '500',
    },
});

export default RSVPCard;