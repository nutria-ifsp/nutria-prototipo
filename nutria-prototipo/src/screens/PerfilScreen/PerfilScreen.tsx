import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Animated, Easing, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './PerfilScreen.styles';
import { StackScreenProps } from '@react-navigation/stack';
import { PerfilStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const DAILY_GOALS = [
  { id: '1', title: 'Calorias', value: '1.850 / 2.100 kcal', progress: 0.88 },
  { id: '2', title: 'Proteina', value: '98 / 120 g', progress: 0.82 },
  { id: '3', title: 'Agua', value: '1.9 / 2.5 L', progress: 0.76 },
];

type PostComment = {
  id: string;
  username: string;
  text: string;
};

type PerfilPost = {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: PostComment[];
};

const MY_POSTS: PerfilPost[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    caption: 'Almoco completo com foco em proteina e vegetais.',
    likes: 148,
    comments: [
      { id: '1', username: 'ana.fit', text: 'Top! Essa combinacao ficou perfeita.' },
      { id: '2', username: 'dr.nutri', text: 'Muito bom equilibrio de macros.' },
      { id: '3', username: 'joao.treino', text: 'Vou copiar essa ideia para amanha.' },
      { id: '4', username: 'joao.treino', text: 'Vou copiar essa ideia para amanha.' },
      { id: '5', username: 'joao.treino', text: 'Vou copiar essa ideia para amanha.' },
    ],
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80',
    caption: 'Lanche da tarde rapido e nutritivo antes do treino.',
    likes: 96,
    comments: [
      { id: '1', username: 'mari.saude', text: 'Pratico demais para rotina corrida.' },
      { id: '2', username: 'pedro.atleta', text: 'Esse ficou com cara de muito gostoso.' },
    ],
  },
];

type Props = StackScreenProps<PerfilStackParamList, 'PerfilMain'>;

const PerfilScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useSettings();
  const styles = createStyles(theme);
  const [profile, setProfile] = useState(user?.profile ?? null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PerfilPost | null>(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(36)).current;

  const metrics = [
    { id: '1', label: 'Seguidores', value: String(profile?.followersCount ?? 0) },
    { id: '2', label: 'Seguindo', value: String(profile?.followingCount ?? 0) },
    { id: '3', label: 'Posts', value: String(profile?.postsCount ?? 0) },
  ];

  const openComments = (post: PerfilPost) => {
    setSelectedPost(post);
    setIsCommentsVisible(true);
  };

  const closeComments = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 36,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsCommentsVisible(false);
        setSelectedPost(null);
      }
    });
  };

  useEffect(() => {
    if (!isCommentsVisible || !selectedPost) {
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(36);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCommentsVisible, overlayOpacity, selectedPost, sheetTranslateY]);

  useEffect(() => {
    setProfile(user?.profile ?? null);
  }, [user]);

  const loadProfile = async () => {
    try {
      const freshProfile = await api.getProfile();
      setProfile(freshProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.imgur.com/pPL5jeX.png' }} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        <View style={styles.profileCard}>
          <Image
            source={{ uri: profile?.avatarUrl || 'https://i.imgur.com/lOsEl90.png' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || user?.username || 'Usuario'}</Text>
            <Text style={styles.handle}>@{user?.username || 'nutriauser'}</Text>
            <Text style={styles.bio}>
              {profile?.bio || 'Sem bio ainda.'}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas do Dia</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Ver plano</Text>
            </TouchableOpacity>
          </View>

          {DAILY_GOALS.map((goal) => (
            <View key={goal.id} style={styles.goalBlock}>
              <View style={styles.goalTextRow}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalValue}>{goal.value}</Text>
              </View>
              <View style={styles.goalTrack}>
                <View
                  style={[
                    styles.goalProgress,
                    { width: `${Math.round(goal.progress * 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('EditarPerfil')}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.actionText}>Editar perfil</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="trophy-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.actionText}>Conquistas</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Configuracoes')}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.actionText}>Configuracoes</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Meus posts</Text>

          {MY_POSTS.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Image source={{ uri: post.image }} style={styles.postImage} />

              <View style={styles.postFooter}>
                <Text style={styles.postCaption}>{post.caption}</Text>

                <View style={styles.postMetaRow}>
                  <Text style={styles.likesText}>{post.likes} curtidas</Text>

                  <TouchableOpacity
                    style={styles.commentsButton}
                    onPress={() => openComments(post)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.commentsButtonText}>
                      Comentarios ({post.comments.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={isCommentsVisible}
        transparent
        animationType="none"
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

export default PerfilScreen;