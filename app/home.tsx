import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();

  async function handleLogout() {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Bem-vindo ao seu painel</Text>

      <View style={styles.grid}>
        <Pressable style={styles.card} onPress={() => router.push('/home')}>
          <Feather name="home" size={24} color="#F5C227" />
          <Text style={styles.cardTitle}>Inicio</Text>
          <Text style={styles.cardText}>Resumo geral do sistema</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/planos')}>
          <Feather name="credit-card" size={24} color="#F5C227" />
          <Text style={styles.cardTitle}>Planos</Text>
          <Text style={styles.cardText}>Gerencie assinaturas e valores</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/bloqueios')}>
          <Feather name="shield-off" size={24} color="#F5C227" />
          <Text style={styles.cardTitle}>Sites Bloqueados</Text>
          <Text style={styles.cardText}>Controle dominios bloqueados</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/perfil' as never)}>
          <Feather name="user" size={24} color="#F5C227" />
          <Text style={styles.cardTitle}>Perfil</Text>
          <Text style={styles.cardText}>Dados e preferencias da conta</Text>
        </Pressable>
      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItemActive} onPress={() => router.push('/home')}>
          <Feather name="home" size={18} color="#121212" />
          <Text style={styles.navTextActive}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/planos')}>
          <Feather name="credit-card" size={18} color="#aaa" />
          <Text style={styles.navText}>Planos</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/bloqueios')}>
          <Feather name="shield-off" size={18} color="#aaa" />
          <Text style={styles.navText}>Bloqueios</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/perfil' as never)}>
          <Feather name="user" size={18} color="#aaa" />
          <Text style={styles.navText}>Perfil</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 14,
    minHeight: 130,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardText: {
    color: '#b3b3b3',
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomNav: {
    marginTop: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  navItemActive: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    backgroundColor: '#F5C227',
    borderRadius: 10,
    paddingVertical: 8,
  },
  navText: {
    color: '#aaa',
    fontSize: 11,
  },
  navTextActive: {
    color: '#121212',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#F5C227',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
});