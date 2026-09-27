/**
 * AnalisarRefeicaoScreen - Tira ou escolhe uma foto da refeição e envia para a IA
 * (endpoint POST /api/mealanalysis/analyze) que retorna calorias e macros estimados.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../types/navigation';
import { createStyles } from './AnalisarRefeicaoScreen.styles';
import { useSettings } from '../../context/SettingsContext';
import * as api from '../../services/api';

type Props = StackScreenProps<RootStackParamList, 'AnalisarRefeicao'>;

const AnalisarRefeicaoScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useSettings();
  const styles = createStyles(theme);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<api.MealAnalysisResult | null>(null);

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão da galeria para escolher uma foto.');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão da câmera para tirar uma foto.');
      return false;
    }
    return true;
  };

  const resetSelection = () => {
    setImageUri(null);
    setImageBase64(null);
    setResult(null);
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!pickResult.canceled && pickResult.assets[0]?.uri) {
      setResult(null);
      setImageUri(pickResult.assets[0].uri);
      setImageBase64(pickResult.assets[0].base64 ?? null);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const pickResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!pickResult.canceled && pickResult.assets[0]?.uri) {
      setResult(null);
      setImageUri(pickResult.assets[0].uri);
      setImageBase64(pickResult.assets[0].base64 ?? null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      Alert.alert('Erro', 'Selecione ou tire uma foto da refeição primeiro.');
      return;
    }

    try {
      setAnalyzing(true);
      const analysis = await api.analyzeMeal(imageBase64);
      setResult(analysis);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível analisar a refeição.';
      Alert.alert('Erro na análise', message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={analyzing}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textStrong} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análise por IA</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!imageUri ? (
          <View style={styles.pickerBox}>
            <Ionicons name="camera-outline" size={48} color={theme.colors.textSubtitle} />
            <Text style={styles.pickerText}>Tire ou escolha uma foto do seu prato</Text>
            <Text style={styles.pickerSubtext}>
              A IA vai estimar as calorias e os macronutrientes automaticamente
            </Text>

            <View style={styles.pickerButtonsRow}>
              <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
                <Ionicons name="camera" size={22} color="#FFF" />
                <Text style={styles.pickerButtonText}>Câmera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, styles.pickerButtonSecondary]}
                onPress={pickFromGallery}
              >
                <Ionicons name="images" size={22} color={theme.colors.primary} />
                <Text style={[styles.pickerButtonText, { color: theme.colors.primary }]}>
                  Galeria
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity style={styles.changeImageButton} onPress={resetSelection} disabled={analyzing}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {!result && (
              <TouchableOpacity
                style={[styles.analyzeButton, { opacity: analyzing ? 0.6 : 1 }]}
                onPress={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#FFF" />
                    <Text style={styles.analyzeButtonText}>Analisar com IA</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {result && (
              <View style={styles.resultCard}>
                <Text style={styles.resultDescription}>{result.description}</Text>

                <View style={styles.caloriesBox}>
                  <Text style={styles.caloriesValue}>{Math.round(result.calories)}</Text>
                  <Text style={styles.caloriesLabel}>kcal estimadas</Text>
                </View>

                <View style={styles.macrosRow}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{Math.round(result.proteinGrams)}g</Text>
                    <Text style={styles.macroLabel}>Proteína</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{Math.round(result.carbsGrams)}g</Text>
                    <Text style={styles.macroLabel}>Carboidrato</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{Math.round(result.fatGrams)}g</Text>
                    <Text style={styles.macroLabel}>Gordura</Text>
                  </View>
                </View>

                {result.items.length > 0 && (
                  <View style={styles.itemsList}>
                    <Text style={styles.itemsTitle}>Alimentos identificados</Text>
                    {result.items.map((item, index) => (
                      <View key={`${item.name}-${index}`} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemDetail}>
                          {Math.round(item.estimatedGrams)}g · {Math.round(item.calories)} kcal
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.confidenceText}>
                  Confiança da estimativa: {Math.round(result.confidence * 100)}%
                </Text>

                <TouchableOpacity style={styles.retryButton} onPress={resetSelection}>
                  <Text style={styles.retryButtonText}>Analisar outra foto</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AnalisarRefeicaoScreen;
