import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    useWindowDimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS, RADII, SHADOWS } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';
import interests from '../../../data/interests';

const InterestInputModal = ({
    visible,
    onClose,
    onAddInterest,
    existingInterests = []
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const { colors } = useTheme();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    const styles = getStyles(colors, isLandscape);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleToggleInterest = (interest) => {
        setSelectedInterests(prev => {
            if (prev.includes(interest)) {
                return prev.filter(item => item !== interest);
            } else {
                return [...prev, interest];
            }
        });
    };

    const handleAddSelectedInterests = () => {
        if (selectedInterests.length === 0) {
            Alert.alert('Error', 'Please select at least one interest');
            return;
        }

        // Add all selected interests
        selectedInterests.forEach(interest => {
            onAddInterest(interest);
        });

        setSelectedInterests([]);
        setSearchQuery('');
        onClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedInterests([]);
        onClose();
    };

    // Filter interests based on search query and exclude existing ones
    const filteredInterests = interests
        .map(interest => interest.label)
        .filter(suggestion => {
            // Exclude already existing interests
            const isExisting = existingInterests.some(
                existing => existing.toLowerCase() === suggestion.toLowerCase()
            );

            // Filter by search query if provided
            const matchesSearch = searchQuery.trim() === '' ||
                suggestion.toLowerCase().includes(searchQuery.toLowerCase());

            return !isExisting && matchesSearch;
        });



    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Add Interests {selectedInterests.length > 0 && `(${selectedInterests.length} selected)`}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContentContainer}
                    >
                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputContainer}>
                                <MaterialIcons
                                    name="search"
                                    size={20}
                                    color={colors.textSecondary || '#666'}
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search interests..."
                                    placeholderTextColor={colors.textSecondary}
                                    returnKeyType="search"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={handleClearSearch}
                                        style={styles.clearButton}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons
                                            name="clear"
                                            size={18}
                                            color={colors.textSecondary || '#666'}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {selectedInterests.length > 0 && (
                            <View style={styles.selectedContainer}>
                                <Text style={styles.selectedTitle}>Selected Interests:</Text>
                                <View style={styles.selectedGrid}>
                                    {selectedInterests.map((interest, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.selectedTag}
                                            onPress={() => handleToggleInterest(interest)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.selectedText}>{interest}</Text>
                                            <MaterialIcons name="close" size={16} color={colors.light} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.interestsContainer}>
                            <Text style={styles.interestsTitle}>
                                {searchQuery.trim() ?
                                    `Search Results (${filteredInterests.length} found)` :
                                    `Available Interests (${filteredInterests.length} total)`
                                }
                            </Text>
                            {filteredInterests.length > 0 ? (
                                <View style={styles.interestsGrid}>
                                    {filteredInterests.map((interest, index) => {
                                        const isSelected = selectedInterests.includes(interest);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.interestTag,
                                                    isSelected && styles.interestTagSelected
                                                ]}
                                                onPress={() => handleToggleInterest(interest)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.interestText,
                                                    isSelected && styles.interestTextSelected
                                                ]}>
                                                    {interest}
                                                </Text>
                                                {isSelected && (
                                                    <MaterialIcons
                                                        name="check"
                                                        size={14}
                                                        color={colors.light || '#fff'}
                                                        style={styles.checkIcon}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.noResultsText}>
                                    {searchQuery.trim() ?
                                        `No interests found matching "${searchQuery}"` :
                                        'All interests have been added'
                                    }
                                </Text>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                selectedInterests.length === 0 && styles.addButtonDisabled
                            ]}
                            onPress={handleAddSelectedInterests}
                            disabled={selectedInterests.length === 0}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.addButtonText}>
                                Add {selectedInterests.length > 0 ? `(${selectedInterests.length})` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (colors, isLandscape) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: colors.background || '#fff',
        borderRadius: RADII.large,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        height: '85%',
        ...SHADOWS.modal,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: colors.text || '#000',
        fontSize: isLandscape ? 18 : 20,
        fontFamily: FONTS.heading,
        fontWeight: '600',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        flex: 1,
        marginBottom: 20,
    },
    scrollContentContainer: {
        paddingBottom: 20,
    },
    searchContainer: {
        marginBottom: 20,
        width: '100%',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface || '#f0f0f0',
        borderRadius: RADII.rounded,
        borderWidth: 1,
        borderColor: colors.border || '#ccc',
        paddingHorizontal: 12,
        minHeight: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.body,
        color: colors.text || '#000',
        paddingVertical: 12,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    interestsContainer: {
        marginBottom: 20,
        width: '100%',
    },
    interestsTitle: {
        color: colors.text || '#000',
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.heading,
        fontWeight: '600',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        width: '100%',
        justifyContent: 'flex-start',
    },

    selectedContainer: {
        marginBottom: 20,
    },
    selectedTitle: {
        color: colors.text || '#000',
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.heading,
        fontWeight: '600',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    selectedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-start',
    },
    selectedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADII.pill,
        gap: 6,
        ...SHADOWS.card,
    },
    selectedText: {
        color: colors.light || '#fff',
        fontSize: isLandscape ? 12 : 13,
        fontFamily: FONTS.body,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    interestTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface || '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADII.pill,
        borderWidth: 1,
        borderColor: colors.border || 'rgba(0,0,0,0.1)',
        gap: 4,
        ...SHADOWS.card,
    },
    interestTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        ...SHADOWS.card,
    },
    interestText: {
        color: colors.textSecondary || '#666',
        fontSize: isLandscape ? 12 : 13,
        fontFamily: FONTS.body,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    interestTextSelected: {
        color: colors.light || '#fff',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    checkIcon: {
        marginLeft: 2,
    },
    noResultsText: {
        color: colors.textSecondary || '#666',
        fontSize: isLandscape ? 13 : 14,
        fontFamily: FONTS.body,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: 12,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.body,
        fontWeight: '500',
    },
    addButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        ...SHADOWS.btnPrimary,
    },
    addButtonDisabled: {
        backgroundColor: colors.surface,
        opacity: 0.5,
    },
    addButtonText: {
        color: colors.light,
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.body,
        fontWeight: '600',
    },
});

export default InterestInputModal;