import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADII } from '../../../constants/constants';

const SelectOption = ({ title, options, selectedValue, onSelect }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleSelect = (value) => {
        onSelect(value);
        setIsModalVisible(false);
    };

    const renderOption = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.optionItem,
                item === selectedValue && styles.selectedOption
            ]}
            onPress={() => handleSelect(item)}
        >
            <Text style={[
                styles.optionText,
                item === selectedValue && styles.selectedOptionText
            ]}>
                {item}
            </Text>
            {item === selectedValue && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={() => setIsModalVisible(true)}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.selectedValue}>{selectedValue}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.light} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            renderItem={renderOption}
                            keyExtractor={(item) => item}
                            style={styles.optionsList}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: FONTS.body,
        marginBottom: 2,
    },
    selectedValue: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.body,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.rounded,
        width: '80%',
        maxHeight: '60%',
        // ...SHADOWS.glassCard,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    modalTitle: {
        color: COLORS.light,
        fontSize: 18,
        fontWeight: '600',
        fontFamily: FONTS.heading,
    },
    closeButton: {
        padding: 5,
    },
    optionsList: {
        maxHeight: 200,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    selectedOption: {
        backgroundColor: COLORS.glass,
    },
    optionText: {
        color: COLORS.light,
        fontSize: 16,
        fontFamily: FONTS.body,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: '500',
    },
});

export default SelectOption;