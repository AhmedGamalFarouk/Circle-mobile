import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

export default StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.largeRounded,
        borderBottomRightRadius: RADII.largeRounded,
        padding: 25,
        width: '100%',
    },
    pollQuestion: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.darker,
        padding: 18,
        borderRadius: RADII.rounded,
        marginBottom: 12,
    },
    optionText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
    voteCount: {
        color: COLORS.primary,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 16,
    },
    finishButton: {
        backgroundColor: COLORS.accent,
        padding: 18,
        borderRadius: RADII.pill,
        alignItems: 'center',
        marginTop: 25,
        //...SHADOWS.btnSecondaryHover,
    },
    finishButtonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 18,
    },
});