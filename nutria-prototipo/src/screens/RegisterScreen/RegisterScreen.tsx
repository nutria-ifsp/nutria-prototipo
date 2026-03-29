import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    try {
      // Validation
      if (!name.trim()) {
        setError('Por favor, insira seu nome');
        return;
      }
      if (!email.trim()) {
        setError('Por favor, insira seu e-mail');
        return;
      }
      if (!username.trim()) {
        setError('Por favor, insira um nome de usuário');
        return;
      }
      if (!password.trim()) {
        setError('Por favor, insira uma senha');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não conferem');
        return;
      }

      setError('');
      await register(email.trim(), password, username.trim(), name.trim());
      // Navigation happens automatically via AuthContext
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar';
      setError(errorMessage);
      Alert.alert('Erro de Registro', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textStrong} />
        </TouchableOpacity>

        <Image 
          source={{ uri: 'https://i.imgur.com/pPL5jeX.png' }} 
          style={styles.logo} 
          resizeMode="contain"
        />

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Comece sua jornada saudável hoje.</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            editable={!loading}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Nome de Usuário</Text>
          <TextInput
            style={styles.input}
            placeholder="seu_usuario"
            value={username}
            onChangeText={(text) => {
              setUsername(text.replace(/\s/g, ''));
              setError('');
            }}
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            editable={!loading}
          />

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError('');
            }}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.nextButton, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.loginLinkText}>
            Já tem uma conta? <Text style={{fontWeight: '700', color: theme.colors.primary}}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.padding,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  logo: {
    width: 100,
    height: 40,
    alignSelf: 'center',
    marginBottom: 30,
  },
  headerTextContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.textStrong,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSubtitle,
    marginTop: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#c62828',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textStrong,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.spacing.borderRadius,
    padding: 15,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: theme.spacing.borderRadius,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 20,
  },
  loginLinkText: {
    color: theme.colors.textSubtitle,
    fontSize: 14,
  },
});

export default RegisterScreen;