/**
 * CreatePostScreen - Upload and create new posts
 * Users can select images from their device and add captions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'CreatePost'> & {
  navigation: any;
};

const CreatePostScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao tirar foto');
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!selectedImage) {
        Alert.alert('Erro', 'Selecione uma imagem');
        return;
      }

      if (!caption.trim()) {
        Alert.alert('Erro', 'Digite uma legenda para o post');
        return;
      }

      setLoading(true);

      // TODO: In production, you would upload the image to a CDN/cloud storage
      // and get a URL back. For now, we'll use a placeholder.
      // In a real app, implement image upload to AWS S3, Firebase, or similar
      
      const imageUrl = selectedImage; // Replace with uploaded URL in production
      
      await api.createPost({
        caption: caption.trim(),
        imageUrl: imageUrl,
      });

      Alert.alert('Sucesso', 'Post criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setCaption('');
            setSelectedImage(null);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar post';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textStrong} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Post</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          disabled={loading || !selectedImage}
        >
          <Text style={[styles.shareButton, { opacity: loading || !selectedImage ? 0.5 : 1 }]}>
            Compartilhar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Selection */}
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
              disabled={loading}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
              <Text style={styles.changeImageText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={60} color={theme.colors.primary} />
            <Text style={styles.placeholderText}>Selecione uma foto</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, { marginRight: 8 }]}
                onPress={pickImage}
                disabled={loading}
              >
                <Ionicons name="images-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Galeria</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={takePhoto}
                disabled={loading}
              >
                <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Câmera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caption Input */}
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user?.profile?.avatarUrl || 'https://randomuser.me/api/portraits/women/1.jpg',
            }}
            style={styles.userAvatar}
          />
          <View style={styles.userTextContent}>
            <Text style={styles.username}>{user?.username}</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Descreva seu post..."
              placeholderTextColor={theme.colors.textSubtitle}
              value={caption}
              onChangeText={setCaption}
              multiline
              editable={!loading}
              maxLength={500}
            />
            <Text style={styles.charCount}>{caption.length}/500</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Dica</Text>
          <Text style={styles.tipsText}>
            Adicione emojis e hashtags para aumentar a visibilidade do seu post!
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Criando post...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textStrong,
  },
  shareButton: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  selectedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeImageText: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 300,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.textSubtitle,
    marginTop: 12,
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  userInfo: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userTextContent: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textStrong,
    marginBottom: 8,
  },
  captionInput: {
    fontSize: 14,
    color: theme.colors.textStrong,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textSubtitle,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  tipsContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textStrong,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: theme.colors.textSubtitle,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default CreatePostScreen;
