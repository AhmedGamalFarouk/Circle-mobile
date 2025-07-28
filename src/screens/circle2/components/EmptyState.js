import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADII } from "../../../constants/constants";
import { Text, TouchableOpacity } from "react-native";

const EmptyState = ({ onRefresh }) => {

    return (
        <View style={styles.emptyState}>
            <Ionicons name="people-circle-outline" size={80} color={COLORS.text} />
            <Text style={styles.emptyTitle}>No Circles Found</Text>
            <Text style={styles.emptySubtitle}>
                Create your first circle or join existing ones to get started!
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Ionicons name="refresh" size={20} color={COLORS.light} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
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
        color: COLORS.light,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        color: COLORS.text,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADII.rounded,
        gap: 8,
    },
    refreshButtonText: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
    },


})
