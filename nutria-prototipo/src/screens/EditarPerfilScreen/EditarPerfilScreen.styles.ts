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
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.iconSurface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 34,
    gap: 14,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.lightGray,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 4,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.mutedBackground,
  },
  photoButtonText: {
    color: theme.colors.textStrong,
    fontWeight: '600',
    fontSize: 13,
  },
  fieldBlock: {
    marginTop: 12,
  },
  fieldLabel: {
    color: theme.colors.textSubtitle,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: theme.colors.textStrong,
    backgroundColor: theme.colors.card,
  },
  textArea: {
    minHeight: 92,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  helperText: {
    marginTop: 6,
    color: theme.colors.textSubtitle,
    fontSize: 12,
  },
  saveButton: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
