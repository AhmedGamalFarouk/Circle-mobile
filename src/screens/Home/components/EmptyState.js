import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADII } from "../../../constants/constants";
import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

const EmptyState = ({ onRefresh, message = "No Circles Found", subMessage = "Create your first circle or join existing ones to get started!" }) => {
    const { colors } = useTheme()
    return (
        <View style={styles.emptyState}>
            <Ionicons name="people-circle-outline" size={80} color={colors.text} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{message}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text }]}>
                {subMessage}
            </Text>
            <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.primary }]} onPress={onRefresh}>
                <Ionicons name="refresh" size={20} color={colors.background} />
                <Text style={[styles.refreshButtonText, { color: colors.background }]}>Refresh</Text>
            </TouchableOpacity>
        </View>
    )
}

export default EmptyState

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADII.rounded,
        gap: 8,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },


})