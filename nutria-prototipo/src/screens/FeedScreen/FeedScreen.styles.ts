import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  headerLogo: {
    width: 100,
    height: 35,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconBadge: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 12,
  },
  storiesBar: {
    paddingVertical: 15,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  storyBubble: {
    alignItems: 'center',
    marginLeft: 18,
    width: 70,
  },
  storyGradient: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2.5,
    backgroundColor: theme.colors.primary,
    marginBottom: 6,
  },
  storyInnerBorder: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 2,
  },
  storyImg: {
    flex: 1,
    borderRadius: 30,
  },
  storyUsername: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  postCard: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    borderRadius: 20,
    marginHorizontal: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  username: {
    fontWeight: '700',
    fontSize: 15,
    color: theme.colors.textStrong,
  },
  streakBadge: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 13,
    marginTop: -5,
  },
  postImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#F0F0F0',
  },
  postFooter: {
    padding: 15,
  },
  interactions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  likesCount: {
    fontWeight: '700',
    fontSize: 14,
    color: theme.colors.textStrong,
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  addComment: {
    color: '#AAA',
    fontSize: 13,
    marginTop: 12,
  },
  commentPreview: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  commentPreviewUser: {
    fontWeight: '700',
    color: '#333',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayPressable: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    paddingBottom: 28,
    minHeight: 280,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  commentItem: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 19,
  },
});