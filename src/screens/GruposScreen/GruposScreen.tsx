import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { styles } from './GruposScreen.styles';

const STORIES = [
  { id: '1', username: 'Seu Perfil', image: 'https://i.imgur.com/lOsEl90.png', isMe: true },
  { id: '2', username: 'ana.nutri', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', username: 'joao.fit', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '4', username: 'marilia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

const GruposScreen: React.FC = () => {
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
    </View>
  );
};

export default GruposScreen;