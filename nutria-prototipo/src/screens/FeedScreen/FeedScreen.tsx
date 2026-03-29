import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, ImageBackground, Modal, Animated, Easing, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { styles } from './FeedScreen.styles';

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
};

const FeedScreen: React.FC = () => {
  const [posts] = useState<FeedPost[]>([
    {
      id: '1',
      username: 'NutriaUser',
      userImage: 'https://i.imgur.com/lOsEl90.png',
      postImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      streak: 5,
      likes: 124,
      caption: 'Almoço focado no objetivo de hoje! Muita cor e proteína. 🥗🍗',
      isLiked: false,
      comments: [
        { id: '1', username: 'ana.nutri', text: 'Esse prato ficou lindo e completo!' },
        { id: '2', username: 'joao.fit', text: 'Boa! Proteina no ponto.' },
        { id: '3', username: 'carla.saude', text: 'Quero essa receita para hoje.' },
        { id: '4', username: 'carla.saude', text: 'Quero essa receita para hoje.' },
        { id: '5', username: 'carla.saude', text: 'Quero essa receita para hoje.' },
      ],
    },
    {
      id: '2',
      username: 'ana.nutri',
      userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      postImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
      streak: 12,
      likes: 850,
      caption: 'Dica do dia: preparem seus lanches na noite anterior! 🍎🥜',
      isLiked: true,
      comments: [
        { id: '1', username: 'nutria.user', text: 'Dica de ouro para a semana.' },
        { id: '2', username: 'marilia', text: 'Ja faco isso e ajuda muito mesmo.' },
      ],
    }
  ]);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.imgur.com/pPL5jeX.png' }} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge}>
            <Ionicons name="search-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBadge}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
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
                <TouchableOpacity>
                  <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={28} color={item.isLiked ? theme.colors.danger : "#333"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openComments(item)}>
                  <Ionicons name="chatbubble-outline" size={26} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="paper-plane-outline" size={26} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.likesCount}>{item.likes} curtidas</Text>
              <Text style={styles.caption}>
                <Text style={styles.username}>{item.username} </Text>
                {item.caption}
              </Text>
              {item.comments.length > 0 && (
                <Text style={styles.commentPreview}>
                  <Text style={styles.commentPreviewUser}>{item.comments[0].username} </Text>
                  {item.comments[0].text}
                </Text>
              )}
              <TouchableOpacity onPress={() => openComments(item)}>
                <Text style={styles.addComment}>Ver todos os {item.comments.length} comentarios</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

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

            {selectedPost?.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.username}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default FeedScreen;