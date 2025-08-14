import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const TabBar = ({ activeTab, onTabPress, tabs }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tab,
                        activeTab === tab.key && { borderBottomColor: colors.primary }
                    ]}
                    onPress={() => onTabPress(tab.key)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === tab.key ? colors.primary : colors.text },
                            activeTab === tab.key && styles.activeTabText
                        ]}
                    >
                        {tab.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingHorizontal: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: '600',
    },
});

export default TabBar;