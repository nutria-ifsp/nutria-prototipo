import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  NativeSyntheticEvent, 
  NativeScrollEvent 
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { theme } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  highlight?: string;
  subtitle: string;
  image: string;
  isFirst?: boolean;
}

const DATA: OnboardingItem[] = [
  {
    id: '1',
    title: 'Seja bem vindo(a)',
    subtitle: 'Alimentando uma vida saudável',
    image: 'https://i.imgur.com/pPL5jeX.png',
    isFirst: true,
  },
  {
    id: '2',
    title: 'Sua saúde em ',
    highlight: 'primeiro lugar',
    subtitle: 'Acompanhe sua evolução, conecte-se com amigos e alcance seus objetivos.',
    image: 'https://i.imgur.com/lOsEl90.png',
  },
  {
    id: '3',
    title: 'Sua saúde em ',
    highlight: 'primeiro lugar',
    subtitle: 'Acompanhe sua evolução, conecte-se com amigos e alcance seus objetivos.',
    image: 'https://i.imgur.com/lOsEl90.png',
  },
  {
    id: '4',
    title: 'Sua saúde em ',
    highlight: 'primeiro lugar',
    subtitle: 'Acompanhe sua evolução, conecte-se com amigos e alcance seus objetivos.',
    image: 'https://i.imgur.com/lOsEl90.png',
  },
];

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Lógica para atualizar o index da página ao deslizar
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setActiveIndex(index);
  };

  const goToNext = () => {
    if (activeIndex < DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      navigation.navigate('Login');
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.page}>
      <View style={styles.content}>
        {item.isFirst ? (
          <>
            <Text style={styles.welcomeText}>{item.title}</Text>
            <Image source={{ uri: item.image }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </>
        ) : (
          <>
            <Image source={{ uri: item.image }} style={styles.illustration} resizeMode="contain" />
            <Text style={styles.title}>
              {item.title}
              <Text style={{ color: theme.colors.primary }}>{item.highlight}</Text>
            </Text>
            <Text style={styles.description}>{item.subtitle}</Text>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.circleBg} />
      
      <FlatList
        ref={flatListRef}
        data={DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        {/* Dots Animados (Simples) */}
        <View style={styles.dotContainer}>
          {DATA.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { 
                  backgroundColor: activeIndex === index ? theme.colors.primary : '#DDD',
                  width: activeIndex === index ? 20 : 8
                }
              ]} 
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnSecondaryText}>Pular</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary} onPress={goToNext}>
            <Text style={styles.btnPrimaryText}>
              {activeIndex === DATA.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  page: { width, justifyContent: 'center', alignItems: 'center' },
  circleBg: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(254, 74, 1, 0.05)',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20 },
  logo: { width: width * 0.7, height: 100, marginBottom: 24 },
  illustration: { width: width * 0.7, height: width * 0.7, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', lineHeight: 36, marginBottom: 15 },
  subtitle: { fontSize: 16, color: theme.colors.textSubtitle, textAlign: 'center' },
  description: { fontSize: 16, color: theme.colors.textSubtitle, textAlign: 'center', lineHeight: 24 },
  footer: { padding: 30, paddingBottom: 50 },
  dotContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
  dot: { 
    height: 8, 
    borderRadius: 4, 
    marginHorizontal: 4
  },
  buttonRow: { flexDirection: 'row', gap: 15 },
  btnPrimary: { flex: 2, backgroundColor: theme.colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnSecondary: { flex: 1, backgroundColor: '#FFF', padding: 18, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  btnSecondaryText: { color: theme.colors.textSubtitle, fontSize: 16, fontWeight: '600' },
});

export default OnboardingScreen;