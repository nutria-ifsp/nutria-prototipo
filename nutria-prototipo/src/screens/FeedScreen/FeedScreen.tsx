import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, ImageBackground, Modal, Animated, Easing, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { createStyles } from './FeedScreen.styles';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { RootStackParamList } from '../../types/navigation';

const STORIES = [
  { id: '1', username: 'Seu Perfil', image: 'https://i.imgur.com/lOsEl90.png', isMe: true },
  { id: '2', username: 'ana.nutri', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', username: 'joao.fit', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '4', username: 'marilia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: '5', username: 'marilia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: '6', username: 'marilia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: '7', username: 'marilia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

type PostComment = {
  id: string;
  username: string;
  text: string;
};

type FeedPost = {
  id: string;
  username: string;
  userImage: string;
  postImage: string;
  streak: number;
  likes: number;
  caption: string;
  isLiked: boolean;
  comments: PostComment[];
  userId: number;
  likesCount: number;
  commentsCount: number;
};

const FeedScreen: React.FC = () => {
  const { theme } = useSettings();
  const styles = createStyles(theme);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const modalProgress = useRef(new Animated.Value(0)).current;
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const isClosing = useRef(false);

  const overlayOpacity = modalProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetTranslateY = modalProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
  });

  // Load feed on mount
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await api.getFeed(1, 10);
      
      // Convert API response to FeedPost format
      const convertedPosts: FeedPost[] = response.posts.map((post: any) => ({
        id: post.id.toString(),
        username: post.author?.username || 'Unknown',
        userImage: post.author?.profile?.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg',
        postImage: post.imageUrl,
        streak: post.author?.profile?.streak || 0,
        likes: post.likesCount,
        caption: post.caption,
        isLiked: !!post.isLikedByCurrentUser,
        comments: [],
        userId: post.author?.id || 0,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
      }));
      
      setPosts(convertedPosts);
    } catch (error) {
      console.error('Failed to load feed:', error);
      Alert.alert('Erro', 'Falha ao carregar o feed. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        await api.unlikePost(parseInt(postId));
      } else {
        await api.likePost(parseInt(postId));
      }

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
      Alert.alert('Erro', 'Não foi possível curtir o post.');
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    try {
      if (!commentText.trim()) {
        Alert.alert('Erro', 'Digite um comentário');
        return;
      }

      await api.addComment(parseInt(postId), commentText);
      
      // Reload feed to get updated comments
      await loadFeed();
      closeComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o comentário.');
    }
  };

  const runModalAnimation = (toValue: 0 | 1, onFinished?: () => void) => {
    currentAnimation.current?.stop();
    currentAnimation.current = Animated.timing(modalProgress, {
      toValue,
      duration: toValue === 1 ? 280 : 220,
      easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    currentAnimation.current.start(({ finished }) => {
      if (finished) {
        onFinished?.();
      }
    });
  };

  const openComments = (post: FeedPost) => {
    isClosing.current = false;
    setSelectedPost(post);
    setIsCommentsVisible(true);
  };

  const closeComments = () => {
    if (!isCommentsVisible || isClosing.current) {
      return;
    }

    isClosing.current = true;
    runModalAnimation(0, () => {
      isClosing.current = false;
      setIsCommentsVisible(false);
      setSelectedPost(null);
    });
  };

  useEffect(() => {
    if (!isCommentsVisible || !selectedPost) {
      currentAnimation.current?.stop();
      modalProgress.setValue(0);
      return;
    }

    runModalAnimation(1);
  }, [isCommentsVisible, modalProgress, selectedPost]);

  useEffect(() => {
    return () => {
      currentAnimation.current?.stop();
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.imgur.com/pPL5jeX.png' }} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge}>
            <Ionicons name="search-outline" size={22} color={theme.colors.textStrong} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBadge}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.textStrong} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: theme.colors.textSubtitle }}>Nenhum post ainda. Comece a seguir pessoas!</Text>
          </View>
        }
        ListHeaderComponent={() => (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesBar}>
            {STORIES.map(story => (
              <TouchableOpacity key={story.id} style={styles.storyBubble}>
                <View style={[styles.storyGradient, story.isMe && { backgroundColor: '#DDD' }]}>
                  <View style={styles.storyInnerBorder}>
                    <Image source={{ uri: story.image }} style={styles.storyImg} />
                  </View>
                </View>
                <Text style={styles.storyUsername} numberOfLines={1}>{story.username}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Image source={{ uri: item.userImage }} style={styles.userAvatar} />
                <Text style={styles.username}>{item.username}</Text>
              </View>
              <ImageBackground source={{ uri: 'https://i.imgur.com/gBaznSm.png' }} style={styles.streakBadge}>
                <Text style={styles.streakText}>{item.streak}</Text>
              </ImageBackground>
            </View>

            <Image source={{ uri: item.postImage }} style={styles.postImage} />

            <View style={styles.postFooter}>
              <View style={styles.interactions}>
                <TouchableOpacity onPress={() => handleLike(item.id)}>
                  <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={28} color={item.isLiked ? theme.colors.danger : theme.colors.textStrong} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openComments(item)}>
                  <Ionicons name="chatbubble-outline" size={26} color={theme.colors.textStrong} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="paper-plane-outline" size={26} color={theme.colors.textStrong} />
                </TouchableOpacity>
              </View>

              <Text style={styles.likesCount}>{item.likesCount} curtidas</Text>
              <Text style={styles.caption}>
                <Text style={styles.username}>{item.username} </Text>
                {item.caption}
              </Text>
              {item.commentsCount > 0 && (
                <TouchableOpacity onPress={() => openComments(item)}>
                  <Text style={styles.addComment}>Ver todos os {item.commentsCount} comentarios</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={isCommentsVisible}
        transparent
        animationType="none"
        hardwareAccelerated
        onRequestClose={closeComments}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalOverlayPressable} onPress={closeComments}>
            <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]} />
          </Pressable>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity onPress={closeComments}>
                <Ionicons name="close" size={22} color={theme.colors.textStrong} />
              </TouchableOpacity>
            </View>

            {selectedPost?.comments && selectedPost.comments.length > 0 ? (
              selectedPost.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentUser}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            ) : (
              <Text style={{ padding: 16, color: theme.colors.textSubtitle }}>Nenhum comentário ainda</Text>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default FeedScreen;