import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Usuario = {
  id: number;
  usuario: string;
  nomeCompleto?: string;
  email: string;
  senha: string;
  fotoPerfil?: string;
  dataNascimento?: string;
};

function getApiBaseUrls() {
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (Platform.OS === 'web') return ['http://localhost:3001'];
  if (expoHost) return [`http://${expoHost}:3001`, 'http://localhost:3001'];
  return ['http://localhost:3001'];
}

export default function Perfil() {
  const router = useRouter();
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaBanco, setSenhaBanco] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      setLoading(true);
      try {
        const userStorage = await AsyncStorage.getItem('user');
        if (!userStorage) {
          alert('Sessao expirada. Faca login novamente.');
          router.replace('/login');
          return;
        }

        const user = JSON.parse(userStorage) as { id?: number; usuario?: string; email?: string; nome?: string };
        const urls = getApiBaseUrls();
        let usuarioApi: Usuario | null = null;

        for (const baseUrl of urls) {
          try {
            if (user.id) {
              const byId = await fetch(`${baseUrl}/usuarios/${user.id}`);
              if (byId.ok) {
                usuarioApi = (await byId.json()) as Usuario;
                break;
              }
            }

            const allResp = await fetch(`${baseUrl}/usuarios`);
            if (!allResp.ok) continue;
            const usuarios = (await allResp.json()) as Usuario[];
            const encontrado = usuarios.find(
              (item) =>
                (!!user.email && item.email.toLowerCase() === user.email.toLowerCase()) ||
                (!!user.usuario && item.usuario.toLowerCase() === user.usuario.toLowerCase())
            );
            if (encontrado) {
              usuarioApi = encontrado;
              break;
            }
          } catch {
            continue;
          }
        }

        if (!usuarioApi) {
          alert('Nao foi possivel carregar os dados do perfil.');
          return;
        }

        setIdUsuario(usuarioApi.id);
        setEmail(usuarioApi.email);
        setDataNascimento(usuarioApi.dataNascimento ?? '');
        setSenhaBanco(usuarioApi.senha);
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setFotoPerfil(usuarioApi.fotoPerfil ?? null);
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, [router]);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      alert('Permita acesso a galeria para escolher sua foto.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets[0]?.uri) {
      setFotoPerfil(resultado.assets[0].uri);
    }
  }

  async function salvarPerfil() {
    if (!idUsuario) return alert('Usuario nao identificado.');
    if (!senhaAtual || !novaSenha || !confirmarSenha) return alert('Preencha todos os campos de senha.');
    if (senhaAtual !== senhaBanco) return alert('Senha atual incorreta.');
    if (novaSenha !== confirmarSenha) return alert('As senhas não conferem.');
    if (novaSenha.length < 8) return alert('A nova senha deve ter pelo menos 8 caracteres.');

    setSaving(true);
    try {
      const urls = getApiBaseUrls();
      let atualizado = false;

      for (const baseUrl of urls) {
        try {
          const response = await fetch(`${baseUrl}/usuarios/${idUsuario}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senha: novaSenha,
              fotoPerfil,
              dataNascimento,
            }),
          });
          if (!response.ok) continue;
          atualizado = true;
          break;
        } catch {
          continue;
        }
      }

      if (!atualizado) {
        alert('Nao foi possivel salvar no servidor fake.');
        return;
      }

      const userStorage = await AsyncStorage.getItem('user');
      const userAtual = userStorage ? (JSON.parse(userStorage) as Record<string, unknown>) : {};
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({
          ...userAtual,
          id: idUsuario,
          fotoPerfil,
        })
      );
      alert('Perfil atualizado com sucesso!');
      setSenhaBanco(novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Altere sua foto e sua senha.</Text>

        {loading ? (
          <ActivityIndicator color="#F5C227" size="large" style={{ marginTop: 28 }} />
        ) : (
          <>
            <View style={styles.avatarBlock}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>Sem foto</Text>
                </View>
              )}
              <Pressable style={styles.photoButton} onPress={escolherFoto}>
                <Text style={styles.photoButtonText}>Anexar foto de perfil</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>E-mail atual</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, styles.inputDisabled]}
              placeholder="Seu e-mail"
              placeholderTextColor="#888"
              autoCapitalize="none"
              editable={false}
              selectTextOnFocus={false}
            />

            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput
              value={dataNascimento}
              onChangeText={setDataNascimento}
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#888"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Senha atual</Text>
            <TextInput
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              style={styles.input}
              placeholder="Digite sua senha atual"
              placeholderTextColor="#888"
              autoCapitalize="none"
              secureTextEntry
            />

            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              value={novaSenha}
              onChangeText={setNovaSenha}
              style={styles.input}
              placeholder="Digite a nova senha"
              placeholderTextColor="#888"
              autoCapitalize="none"
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar a senha</Text>
            <TextInput
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={styles.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#888"
              autoCapitalize="none"
              secureTextEntry
            />

            <Pressable style={styles.button} onPress={salvarPerfil} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#121212" />
              ) : (
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              )}
            </Pressable>
          </>
        )}

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/home')}>
          <Text style={styles.secondaryButtonText}>Voltar para Inicio</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 24,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: '#F5C227',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#1f1f22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#b5b5b5',
    fontSize: 13,
    fontWeight: '600',
  },
  photoButton: {
    backgroundColor: '#232327',
    borderWidth: 1,
    borderColor: '#3a3a40',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  photoButtonText: {
    color: '#e5e5ea',
    fontWeight: '700',
    fontSize: 13,
  },
  label: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f1f22',
    borderWidth: 1,
    borderColor: '#34343a',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  inputDisabled: {
    opacity: 0.7,
    backgroundColor: '#19191b',
  },
  button: {
    backgroundColor: '#F5C227',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: '#222227',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34343a',
  },
  secondaryButtonText: {
    color: '#d8d8de',
    fontWeight: '700',
    fontSize: 14,
  },
});
