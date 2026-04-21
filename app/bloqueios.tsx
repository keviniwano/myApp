import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

const STRICT_MODE_KEY = 'strict_mode_config';
const HORAS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS = Array.from({ length: 12 }, (_, i) => i * 5);

const ITENS = [
  { nome: 'YouTube', icone: 'youtube', cor: '#FF0000', pack: 'mci' },
  { nome: 'Instagram', icone: 'instagram', cor: '#E4405F', pack: 'mci' },
  { nome: 'Facebook', icone: 'facebook', cor: '#1877F2', pack: 'mci' },
  { nome: 'TikTok', icone: 'tiktok', cor: '#e8e8e8', pack: 'fa6' },
  { nome: 'X', icone: 'x-twitter', cor: '#ffffff', pack: 'fa6' },
  { nome: 'Netflix', icone: 'netflix', cor: '#E50914', pack: 'mci' },
] as const;

export default function Bloqueios() {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [duracaoHoras, setDuracaoHoras] = useState(1);
  const [duracaoMinutos, setDuracaoMinutos] = useState(0);
  const [ativoAte, setAtivoAte] = useState<number | null>(null);

  const ativo = !!ativoAte && ativoAte > Date.now();

  const tempoRestante = useMemo(() => {
    if (!ativoAte) return null;
    const diffMs = ativoAte - Date.now();
    if (diffMs <= 0) return null;
    const totalSegundos = Math.floor(diffMs / 1000);
    const h = Math.floor(totalSegundos / 3600);
    const m = Math.floor((totalSegundos % 3600) / 60);
    const s = totalSegundos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }, [ativoAte]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (ativoAte && ativoAte <= Date.now()) setAtivoAte(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [ativoAte]);

  useEffect(() => {
    async function carregar() {
      const raw = await AsyncStorage.getItem(STRICT_MODE_KEY);
      if (!raw) return;
      const dados = JSON.parse(raw) as { selecionados: string[]; ativoAte: number | null };
      setSelecionados(dados.selecionados || []);
      setAtivoAte(dados.ativoAte || null);
    }
    carregar();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STRICT_MODE_KEY, JSON.stringify({ selecionados, ativoAte }));
  }, [selecionados, ativoAte]);

  function alternarItem(item: string) {
    if (ativo) return;
    setSelecionados((atual) =>
      atual.includes(item) ? atual.filter((nome) => nome !== item) : [...atual, item]
    );
  }

  function ativarModo() {
    const totalMin = duracaoHoras * 60 + duracaoMinutos;
    if (totalMin <= 0) return alert('Selecione um tempo valido.');
    if (selecionados.length === 0) return alert('Selecione ao menos um app/site.');
    setAtivoAte(Date.now() + totalMin * 60 * 1000);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Modo Estrito</Text>
        <MaterialCommunityIcons name="information-outline" size={20} color="#9f9fa6" />
      </View>

      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <MaterialCommunityIcons name="lock" size={30} color="#F59E0B" />
        </View>
      </View>

      <Text style={styles.timer}>{tempoRestante ?? '00:00:00'}</Text>
      <Text style={styles.subtitle}>Bloqueios protegidos contra bypass durante o timer.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>METODO DE DESBLOQUEIO</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name="timer-outline" size={18} color="#ddd" />
          <Text style={styles.rowText}>Timer</Text>
          <Text style={styles.rowValue}>
            {duracaoHoras.toString().padStart(2, '0')}h {duracaoMinutos.toString().padStart(2, '0')}m
          </Text>
        </View>

        <View style={[styles.pickerRow, ativo && styles.disabled]}>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Horas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {HORAS.map((h) => (
                <Pressable
                  key={h}
                  style={[styles.chip, duracaoHoras === h && styles.chipActive]}
                  onPress={() => !ativo && setDuracaoHoras(h)}
                >
                  <Text style={[styles.chipText, duracaoHoras === h && styles.chipTextActive]}>
                    {h.toString().padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Min</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {MINUTOS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.chip, duracaoMinutos === m && styles.chipActive]}
                  onPress={() => !ativo && setDuracaoMinutos(m)}
                >
                  <Text style={[styles.chipText, duracaoMinutos === m && styles.chipTextActive]}>
                    {m.toString().padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.presets}>
          {[30, 60, 120].map((p) => {
            const selected = duracaoHoras * 60 + duracaoMinutos === p;
            return (
              <Pressable
                key={p}
                style={[styles.preset, selected && styles.presetActive]}
                onPress={() => {
                  if (ativo) return;
                  setDuracaoHoras(Math.floor(p / 60));
                  setDuracaoMinutos(p % 60);
                }}
              >
                <Text style={[styles.presetText, selected && styles.presetTextActive]}>{p} min</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>APPS E SITES BLOQUEADOS</Text>
        {ITENS.map((item) => {
          const checked = selecionados.includes(item.nome);
          return (
            <View key={item.nome} style={styles.item}>
              <View style={styles.itemLeft}>
                {item.pack === 'fa6' ? (
                  <FontAwesome6 name={item.icone} size={20} color={item.cor} />
                ) : (
                  <MaterialCommunityIcons name={item.icone} size={22} color={item.cor} />
                )}
                <Text style={styles.itemText}>{item.nome}</Text>
              </View>
              <Switch
                value={checked}
                onValueChange={() => alternarItem(item.nome)}
                disabled={ativo}
                trackColor={{ false: '#3b3b3b', true: '#F59E0B' }}
                thumbColor={checked ? '#111' : '#fff'}
              />
            </View>
          );
        })}
      </View>

      {ativo ? (
        <Pressable style={styles.btnStop} onPress={() => setAtivoAte(null)}>
          <Text style={styles.btnStopText}>Encerrar Modo Estrito</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.btnStart} onPress={ativarModo}>
          <Text style={styles.btnStartText}>Ativar Modo Estrito</Text>
        </Pressable>
      )}

      <Pressable style={styles.btnBack} onPress={() => router.push('/home')}>
        <Text style={styles.btnBackText}>Voltar para Inicio</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0D' },
  content: { paddingHorizontal: 16, paddingTop: 42, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  ringOuter: {
    width: 182,
    height: 182,
    borderRadius: 91,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131316',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  ringInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101012',
  },
  timer: { color: '#fff', fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: '#8f8f96', fontSize: 13, textAlign: 'center', marginBottom: 18 },
  card: { backgroundColor: '#161618', borderRadius: 14, borderWidth: 1, borderColor: '#252528', padding: 12, marginBottom: 12 },
  cardLabel: { color: '#8a8a91', fontSize: 11, fontWeight: '700', marginBottom: 10 },
  row: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#2c2c2f',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rowText: { color: '#ddd', fontSize: 14 },
  rowValue: { marginLeft: 'auto', color: '#F59E0B', fontSize: 14, fontWeight: '700' },
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  pickerCol: { flex: 1, backgroundColor: '#141417', borderRadius: 10, borderWidth: 1, borderColor: '#333', padding: 10, gap: 8 },
  pickerLabel: { color: '#a6a6ad', fontSize: 12, fontWeight: '600' },
  chips: { gap: 8, paddingRight: 4 },
  chip: {
    backgroundColor: '#212124',
    borderRadius: 8,
    minWidth: 46,
    height: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3c3c3c',
  },
  chipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  chipText: { color: '#e5e5e5', fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: '#111' },
  presets: { flexDirection: 'row', gap: 8 },
  preset: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#3a3a3a', justifyContent: 'center', alignItems: 'center' },
  presetActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  presetText: { color: '#d7d7dd', fontSize: 12, fontWeight: '600' },
  presetTextActive: { color: '#111' },
  item: {
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemText: { color: '#e5e5e5', fontSize: 14, fontWeight: '600' },
  btnStart: { backgroundColor: '#F59E0B', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  btnStartText: { color: '#111', fontSize: 15, fontWeight: 'bold' },
  btnStop: { backgroundColor: '#3b1f1b', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  btnStopText: { color: '#ffb6a8', fontSize: 15, fontWeight: 'bold' },
  btnBack: {
    backgroundColor: '#222227',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#34343a',
  },
  btnBackText: { color: '#d8d8de', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.55 },
});
