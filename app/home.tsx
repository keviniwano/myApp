import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const STRICT_MODE_KEY = 'strict_mode_config';

function formatTempoRestante(ativoAte: number | null, agora: number) {
  if (!ativoAte) return null;
  const diffMs = ativoAte - agora;
  if (diffMs <= 0) return null;
  const totalSegundos = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Home() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState('Usuario');
  const [ativoAte, setAtivoAte] = useState<number | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [agora, setAgora] = useState(Date.now());
  const [quickSelecionado, setQuickSelecionado] = useState(60);

  useEffect(() => {
    async function carregarUsuario() {
      const userStorage = await AsyncStorage.getItem('user');
      if (!userStorage) return;

      try {
        const user = JSON.parse(userStorage) as { nome?: string; usuario?: string; email?: string };
        if (user?.nome) {
          setNomeUsuario(user.nome);
          return;
        }

        if (user?.usuario) {
          setNomeUsuario(user.usuario);
          return;
        }

        if (user?.email) {
          setNomeUsuario(user.email);
        }
      } catch {

        setNomeUsuario('Usuario');
      }
    }

    carregarUsuario();
  }, []);

  useEffect(() => {
    async function carregarModoEstrito() {
      const raw = await AsyncStorage.getItem(STRICT_MODE_KEY);
      if (!raw) {
        setAtivoAte(null);
        return;
      }

      try {
        const dados = JSON.parse(raw) as { ativoAte?: number | null; selecionados?: string[] };
        setAtivoAte(dados?.ativoAte ?? null);
        setSelecionados(dados?.selecionados ?? []);
      } catch {
        setAtivoAte(null);
        setSelecionados([]);
      }
    }

    carregarModoEstrito();
    const interval = setInterval(() => {
      setAgora(Date.now());
      carregarModoEstrito();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const tempoRestante = formatTempoRestante(ativoAte, agora);
  const modoEstritoAtivo = !!tempoRestante;
  const quickTimers = [30, 60, 120];

  async function salvarModoEstrito(ativoAteNovo: number | null) {
    await AsyncStorage.setItem(
      STRICT_MODE_KEY,
      JSON.stringify({
        selecionados,
        ativoAte: ativoAteNovo,
      })
    );
    setAtivoAte(ativoAteNovo);
  }

  async function handleMainLockPress() {
    if (modoEstritoAtivo) {
      await salvarModoEstrito(null);
      return;
    }

    if (selecionados.length === 0) {
      Alert.alert('Selecione apps primeiro', 'Escolha ao menos um app na tela de bloqueios.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir bloqueios', onPress: () => router.push('/bloqueios') },
      ]);
      return;
    }

    const ativoAteNovo = Date.now() + quickSelecionado * 60 * 1000;
    await salvarModoEstrito(ativoAteNovo);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Bem-vindo, {nomeUsuario}</Text>
      {modoEstritoAtivo ? (
        <View style={styles.strictBanner}>
          <View style={styles.strictBannerLeft}>
            <Feather name="lock" size={16} color="#121212" />
            <Text style={styles.strictBannerText}>Modo Estrito ativo</Text>
          </View>
          <Text style={styles.strictBannerTimer}>{tempoRestante}</Text>
        </View>
      ) : (
        <View style={styles.strictBannerOff}>
          <Feather name="unlock" size={16} color="#9ca3af" />
          <Text style={styles.strictBannerOffText}>Modo Estrito inativo</Text>
        </View>
      )}
      <View style={styles.timerHub}>
        <Text style={styles.timerMainTitle}>Timer de Bloqueio</Text>
        <Text style={styles.timerMainSubtitle}>
          {modoEstritoAtivo
            ? `Ativo: ${tempoRestante}`
            : `Tempo rapido: ${quickSelecionado >= 60 ? `${quickSelecionado / 60}h` : `${quickSelecionado}m`}`}
        </Text>
        <Pressable style={styles.lockHubButton} onPress={handleMainLockPress}>
          <View style={[styles.ringOuter, modoEstritoAtivo && styles.ringOuterActive]}>
            <View style={[styles.ringInner, modoEstritoAtivo && styles.ringInnerActive]}>
              <MaterialCommunityIcons name={modoEstritoAtivo ? 'lock-check' : 'lock'} size={28} color="#F59E0B" />
            </View>
          </View>
        </Pressable>
        <View style={styles.quickActionsRow}>
          {quickTimers.map((min) => (
            <Pressable
              key={min}
              style={[styles.quickAction, quickSelecionado === min && styles.quickActionActive]}
              onPress={() => setQuickSelecionado(min)}
            >
              <Text style={[styles.quickActionText, quickSelecionado === min && styles.quickActionTextActive]}>
                {min >= 60 ? `${min / 60}h` : `${min}m`}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.hubConfigButton} onPress={() => router.push('/bloqueios')}>
          <Text style={styles.hubConfigButtonText}>Configurar apps bloqueados</Text>
        </Pressable>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
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
    marginBottom: 12,
  },
  strictBanner: {
    backgroundColor: '#F5C227',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  strictBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strictBannerText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '700',
  },
  strictBannerTimer: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
  },
  strictBannerOff: {
    backgroundColor: '#1f2124',
    borderWidth: 1,
    borderColor: '#31343a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  strictBannerOffText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  timerHub: {
    backgroundColor: '#1a1a1d',
    borderWidth: 1,
    borderColor: '#2f3138',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    gap: 10,
  },
  timerMainTitle: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  timerMainSubtitle: {
    color: '#b6bbc7',
    fontSize: 12,
    marginTop: -2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  lockHubButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ringOuter: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131316',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  ringOuterActive: {
    shadowColor: '#22c55e',
    borderColor: '#20522f',
  },
  ringInner: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101012',
  },
  ringInnerActive: {
    borderColor: '#22c55e',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3d46',
    backgroundColor: '#22252b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#3a2b12',
  },
  quickActionText: {
    color: '#dde1ea',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionTextActive: {
    color: '#F5C227',
  },
  hubConfigButton: {
    marginTop: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3d46',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#21242a',
  },
  hubConfigButtonText: {
    color: '#cdd3df',
    fontSize: 13,
    fontWeight: '600',
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
    marginTop: 16,
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