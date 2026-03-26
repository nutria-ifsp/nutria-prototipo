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
  ScrollView 
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = StackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Botão de Voltar */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
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

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => navigation.navigate('GoalSelection')} // Próximo passo no HTML
          >
            <Text style={styles.nextButtonText}>Próximo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => navigation.navigate('Login')}
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