import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { darkTheme, lightTheme } from '../../styles/theme';

type Props = StackScreenProps<RootStackParamList, 'UserProfile'>;

type UserPostItem = {
  id: number;
  imageUrl: string;
};

type AppTheme = typeof lightTheme | typeof darkTheme;

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 54,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.textStrong },
    headerIconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.iconSurface,
    },
    profileCard: {
      margin: 14,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 74, height: 74, borderRadius: 37, marginRight: 14, backgroundColor: theme.colors.lightGray },
    name: { fontSize: 18, fontWeight: '700', color: theme.colors.textStrong },
    username: { fontSize: 13, marginTop: 3, color: theme.colors.textSubtitle },
    bio: { marginTop: 10, color: theme.colors.textSubtitle, lineHeight: 18 },
    metricsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    metricBox: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.mutedBackground,
    },
    metricValue: { fontWeight: '800', color: theme.colors.textStrong },
    metricLabel: { fontSize: 12, marginTop: 2, color: theme.colors.textSubtitle },
    followButton: {
      marginTop: 14,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    followingButton: {
      marginTop: 14,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.iconSurface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    followButtonText: { color: '#fff', fontWeight: '700' },
    followingButtonText: { color: theme.colors.textStrong, fontWeight: '700' },
    postsTitle: {
      marginHorizontal: 14,
      marginTop: 2,
      marginBottom: 10,
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textStrong,
    },
    postGridImage: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: theme.colors.lightGray },
    gridItemWrap: { flex: 1 / 3, paddingHorizontal: 4, marginBottom: 8 },
    emptyText: { textAlign: 'center', color: theme.colors.textSubtitle, marginTop: 40 },
  });

const UserProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useSettings();
  const styles = createStyles(theme);
  const { userId, username } = route.params;

  const [profile, setProfile] = useState<api.ProfileDto | null>(null);
  const [posts, setPosts] = useState<UserPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileData, postsData, followingData] = await Promise.all([
        api.getProfileByUsername(username),
        api.getUserPosts(userId, 1, 30),
        api.isFollowingUser(userId),
      ]);

      setProfile(profileData);
      setIsFollowing(followingData.isFollowing);
      setPosts(
        postsData.posts.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
        }))
      );
    } catch (error) {
      console.error('Failed to load user profile data:', error);
      Alert.alert('Erro', 'Não foi possível carregar este perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId, username]);

  const handleToggleFollow = async () => {
    try {
      setFollowLoading(true);
      const response = isFollowing ? await api.unfollowUser(userId) : await api.followUser(userId);
      setIsFollowing(response.isFollowing);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followersCount: response.followersCount,
            }
          : prev
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar follow.';
      Alert.alert('Erro', message);
    } finally {
      setFollowLoading(false);
    }
  };

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
        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textStrong} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{username}</Text>
        <View style={styles.headerIconButton} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: profile?.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.name || username}</Text>
            <Text style={styles.username}>@{username}</Text>
          </View>
        </View>

        {!!profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{profile?.followersCount ?? 0}</Text>
            <Text style={styles.metricLabel}>Seguidores</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{profile?.followingCount ?? 0}</Text>
            <Text style={styles.metricLabel}>Seguindo</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{profile?.postsCount ?? posts.length}</Text>
            <Text style={styles.metricLabel}>Posts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={isFollowing ? styles.followingButton : styles.followButton}
          onPress={handleToggleFollow}
          disabled={followLoading}
        >
          <Text style={isFollowing ? styles.followingButtonText : styles.followButtonText}>
            {followLoading ? 'Atualizando...' : isFollowing ? 'Seguindo' : 'Seguir'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.postsTitle}>Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Este usuário ainda não publicou.</Text>}
        renderItem={({ item }) => (
          <View style={styles.gridItemWrap}>
            <Image source={{ uri: item.imageUrl }} style={styles.postGridImage} />
          </View>
        )}
      />
    </View>
  );
};

export default UserProfileScreen;
