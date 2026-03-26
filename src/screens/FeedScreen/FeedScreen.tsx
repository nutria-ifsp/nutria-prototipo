import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
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

const FeedScreen: React.FC = () => {
  const [posts] = useState([
    {
      id: '1',
      username: 'NutriaUser',
      userImage: 'https://i.imgur.com/lOsEl90.png',
      postImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      streak: 5,
      likes: 124,
      caption: 'Almoço focado no objetivo de hoje! Muita cor e proteína. 🥗🍗',
      isLiked: false,
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
    }
  ]);

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
                <TouchableOpacity>
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
              <Text style={styles.addComment}>Ver todos os 12 comentários</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FeedScreen;