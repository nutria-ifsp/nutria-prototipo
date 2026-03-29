import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { PerfilStackParamList } from '../../types/navigation';
import { createStyles } from './EditarPerfilScreen.styles';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

type Props = StackScreenProps<PerfilStackParamList, 'EditarPerfil'>;

const EditarPerfilScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useSettings();
  const styles = createStyles(theme);
  const { user, updateProfile } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profile?.avatarUrl || 'https://i.imgur.com/lOsEl90.png');
  const [name, setName] = useState(user?.profile?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos da permissao da galeria para escolher uma foto.');
      return false;
    }

    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos da permissao da camera para tirar uma foto.');
      return false;
    }

    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestMediaPermission();

    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nome invalido', 'Digite um nome para salvar o perfil.');
      return;
    }

    const normalizedUsername = username.trim().replace(/^@+/, '');
    if (!normalizedUsername) {
      Alert.alert('Usuario invalido', 'Digite um nome de usuario.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        username: normalizedUsername,
        bio: bio.trim(),
        avatarUrl: profileImage,
      });

      Alert.alert('Perfil atualizado', 'Suas alteracoes foram salvas com sucesso.');
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao salvar alteracoes.';
      Alert.alert('Erro', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()} disabled={saving}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.textStrong} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Perfil</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImageFromGallery} disabled={saving}>
              <Ionicons name="images-outline" size={17} color={theme.colors.textStrong} />
              <Text style={styles.photoButtonText}>Escolher da galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoButton} onPress={takePicture} disabled={saving}>
              <Ionicons name="camera-outline" size={17} color={theme.colors.textStrong} />
              <Text style={styles.photoButtonText}>Tirar foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor="#A0A4AD"
              editable={!saving}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="@seuusuario"
              placeholderTextColor="#A0A4AD"
              autoCapitalize="none"
              editable={!saving}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Conte um pouco sobre voce"
              placeholderTextColor="#A0A4AD"
              multiline
              maxLength={180}
              editable={!saving}
            />
            <Text style={styles.helperText}>{bio.length}/180</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving}>
          <Ionicons name="save-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar alteracoes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditarPerfilScreen;
