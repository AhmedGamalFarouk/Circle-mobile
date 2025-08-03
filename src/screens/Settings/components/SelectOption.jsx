import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADII } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const SelectOption = ({ title, options, selectedValue, onSelect }) => {
    const { colors } = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleSelect = (value) => {
        onSelect(value);
        setIsModalVisible(false);
    };

    const renderOption = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.optionItem,
                { borderBottomColor: colors.border },
                item === selectedValue && [styles.selectedOption, { backgroundColor: colors.glass }]
            ]}
            onPress={() => handleSelect(item)}
        >
            <Text style={[
                styles.optionText,
                { color: colors.text },
                item === selectedValue && [styles.selectedOptionText, { color: colors.primary }]
            ]}>
                {item}
            </Text>
            {item === selectedValue && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
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
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.selectedValue, { color: colors.textSecondary }]}>{selectedValue}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
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
        fontSize: 16,
        fontWeight: '500',
        fontFamily: FONTS.body,
        marginBottom: 2,
    },
    selectedValue: {
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
    },
    modalTitle: {
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
    },
    selectedOption: {
        // backgroundColor will be set dynamically
    },
    optionText: {
        fontSize: 16,
        fontFamily: FONTS.body,
    },
    selectedOptionText: {
        fontWeight: '500',
    },
});

export default SelectOption;