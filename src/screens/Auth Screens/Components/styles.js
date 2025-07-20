import { StyleSheet } from 'react-native';
import { COLORS, RADII } from '../../../constants/constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darker,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 40,
        borderRadius: RADII.pill, // Make it circular
        backgroundColor: COLORS.primary, // Blue background for the circle
        resizeMode: 'contain', // Ensure the icon fits
    },
    welcomeText: {
        color: COLORS.light,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        borderColor: COLORS.text,
        borderWidth: 1,
        borderRadius: RADII.rounded,
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        color: COLORS.light,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        width: '100%',
        height: 50,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    loginButtonText: {
        color: COLORS.light,
        fontSize: 18,
        fontWeight: 'bold',
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.text,
    },
    orText: {
        color: COLORS.text,
        marginHorizontal: 10,
        fontSize: 16,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginBottom: 50,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: RADII.largeRounded,
        backgroundColor: COLORS.dark,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.text,
    },
    signUpText: {
        color: COLORS.light,
        fontSize: 16,
    },
    signUpLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});