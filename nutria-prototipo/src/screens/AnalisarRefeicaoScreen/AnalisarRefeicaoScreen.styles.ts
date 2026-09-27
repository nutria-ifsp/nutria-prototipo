import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../styles/theme';

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textStrong,
    },
    content: {
      padding: theme.spacing.padding,
      paddingBottom: 60,
    },
    pickerBox: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.lightGray,
      borderRadius: theme.spacing.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      paddingVertical: 48,
      paddingHorizontal: 24,
      marginTop: 24,
    },
    pickerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textStrong,
      marginTop: 16,
      textAlign: 'center',
    },
    pickerSubtext: {
      fontSize: 13,
      color: theme.colors.textSubtitle,
      marginTop: 6,
      textAlign: 'center',
    },
    pickerButtonsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 28,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: theme.spacing.borderRadius,
    },
    pickerButtonSecondary: {
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    pickerButtonText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: 15,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.spacing.borderRadius,
      overflow: 'hidden',
      marginTop: 12,
      backgroundColor: theme.colors.lightGray,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    changeImageButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    analyzeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.spacing.borderRadius,
      paddingVertical: 16,
      marginTop: 20,
    },
    analyzeButtonText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: 16,
    },
    resultCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.spacing.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      marginTop: 20,
    },
    resultDescription: {
      fontSize: 15,
      color: theme.colors.textStrong,
      marginBottom: 16,
    },
    caloriesBox: {
      alignItems: 'center',
      marginBottom: 20,
    },
    caloriesValue: {
      fontSize: 40,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    caloriesLabel: {
      fontSize: 13,
      color: theme.colors.textSubtitle,
      marginTop: 2,
    },
    macrosRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    macroItem: {
      alignItems: 'center',
    },
    macroValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textStrong,
    },
    macroLabel: {
      fontSize: 12,
      color: theme.colors.textSubtitle,
      marginTop: 2,
    },
    itemsList: {
      marginBottom: 12,
    },
    itemsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textStrong,
      marginBottom: 10,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemName: {
      fontSize: 14,
      color: theme.colors.textStrong,
      flexShrink: 1,
      marginRight: 8,
    },
    itemDetail: {
      fontSize: 13,
      color: theme.colors.textSubtitle,
    },
    confidenceText: {
      fontSize: 12,
      color: theme.colors.textSubtitle,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 16,
    },
    retryButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    retryButtonText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
