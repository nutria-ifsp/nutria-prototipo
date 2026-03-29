import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './ConfiguracoesScreen.styles';
import { StackScreenProps } from '@react-navigation/stack';
import { PerfilStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

type Props = StackScreenProps<PerfilStackParamList, 'Configuracoes'>;

const ConfiguracoesScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { theme, darkMode, setDarkMode } = useSettings();
  const styles = createStyles(theme);

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textStrong} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuracoes</Text>
        <TouchableOpacity style={styles.iconBadge}>
          <Ionicons name="help-circle-outline" size={22} color={theme.colors.textStrong} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="person-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.optionText}>Configurações de Privacidade</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.optionText}>Alterar senha</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="card-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.optionText}>Assinatura premium</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.textStrong} />
              <Text style={styles.optionText}>Notificacoes</Text>
            </View>
            <Switch value thumbColor="#FFF" trackColor={{ false: '#D6D6D6', true: theme.colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textStrong} />
              <Text style={styles.optionText}>Emails semanais</Text>
            </View>
            <Switch value={false} thumbColor="#FFF" trackColor={{ false: '#D6D6D6', true: theme.colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Ionicons name="moon-outline" size={20} color={theme.colors.textStrong} />
              <Text style={styles.optionText}>Modo escuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor="#FFF"
              trackColor={{ false: '#D6D6D6', true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Suporte</Text>

          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.optionText}>Falar com suporte</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.optionText}>Termos e privacidade</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ConfiguracoesScreen;
