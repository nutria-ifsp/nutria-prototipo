import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { styles } from './PerfilScreen.styles';

const METRICS = [
  { id: '1', label: 'Seguidores', value: '1.2K' },
  { id: '2', label: 'Seguindo', value: '340' },
  { id: '3', label: 'Posts', value: '58' },
];

const DAILY_GOALS = [
  { id: '1', title: 'Calorias', value: '1.850 / 2.100 kcal', progress: 0.88 },
  { id: '2', title: 'Proteina', value: '98 / 120 g', progress: 0.82 },
  { id: '3', title: 'Agua', value: '1.9 / 2.5 L', progress: 0.76 },
];

const PerfilScreen: React.FC = () => {
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://i.imgur.com/lOsEl90.png' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Nutria User</Text>
            <Text style={styles.handle}>@nutriauser</Text>
            <Text style={styles.bio}>
              Foco em recomposicao corporal e rotina sem extremismo.
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          {METRICS.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas do dia</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Ver plano</Text>
            </TouchableOpacity>
          </View>

          {DAILY_GOALS.map((goal) => (
            <View key={goal.id} style={styles.goalBlock}>
              <View style={styles.goalTextRow}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalValue}>{goal.value}</Text>
              </View>
              <View style={styles.goalTrack}>
                <View
                  style={[
                    styles.goalProgress,
                    { width: `${Math.round(goal.progress * 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Acoes rapidas</Text>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="create-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.actionText}>Editar perfil</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="trophy-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.actionText}>Conquistas</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.textStrong} />
            <Text style={styles.actionText}>Configuracoes</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PerfilScreen;