import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Um cinza quase branco para destacar os cards
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
  // --- STORIES ---
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
    backgroundColor: theme.colors.primary, // Simula a borda colorida
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
  // --- POST CARD ---
  postCard: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    borderRadius: 20, // Cards arredondados ficam mais modernos
    marginHorizontal: 10,
    overflow: 'hidden',
    // Sombra para o Card
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
  }
});