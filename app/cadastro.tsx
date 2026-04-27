import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Usuario = {
  id?: number;
  usuario: string;
  nomeCompleto?: string;
  email: string;
  senha: string;
};

function getPasswordStrength(password: string) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  if (password.length === 0) {
    return { label: '', color: '#6b7280', progress: 0 };
  }

  const isStrong = hasMinLength && hasUppercase && hasSpecial;
  if (isStrong) {
    return { label: 'Senha forte', color: '#22c55e', progress: 1 };
  }

  const isWeak = hasLowercase && hasNumber && !hasUppercase && !hasSpecial;
  if (isWeak) {
    return { label: 'Senha fraca', color: '#ef4444', progress: 0.33 };
  }

  // Nivel intermediario: possui maiuscula ou caractere especial, mas ainda nao atende aos requisitos de forte.
  if (hasUppercase || hasSpecial) return { label: 'Senha media', color: '#f59e0b', progress: 0.66 };

  // Fallback para entradas incompletas (ex.: apenas letras minusculas).
  return { label: 'Senha fraca', color: '#ef4444', progress: 0.33 };
}

function getApiBaseUrls() {
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (Platform.OS === 'web') {
    return ['http://localhost:3001'];
  }

  if (expoHost) {
    return [`http://${expoHost}:3001`, 'http://localhost:3001'];
  }

  return ['http://localhost:3001'];
}

async function fetchUsuarios(baseUrl: string) {
  const response = await fetch(`${baseUrl}/usuarios`);
  if (!response.ok) throw new Error('Falha ao buscar usuarios');
  const usuarios: Usuario[] = await response.json();
  return usuarios;
}

async function criarUsuario(baseUrl: string, payload: Usuario) {
  const response = await fetch(`${baseUrl}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Falha ao criar usuario');
}

export default function Cadastro() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const senhaStrength = getPasswordStrength(senha);

  async function handleCadastro() {
    const nomeCompletoTrim = nomeCompleto.trim();
    const emailTrim = email.trim().toLowerCase();

    if (!nomeCompletoTrim || !emailTrim || !senha || !confirmarSenha) {
      alert('Preencha todos os campos');
      return;
    }

    if (senha.length < 8) {
      alert('A senha precisa ter no minimo 8 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas nao conferem');
      return;
    }

    setLoading(true);
    try {
      const urls = getApiBaseUrls();
      let cadastroRealizado = false;
      let conectouApi = false;

      for (const baseUrl of urls) {
        try {
          const usuarios = await fetchUsuarios(baseUrl);
          conectouApi = true;

          const usuarioExiste = usuarios.some(
            (item) =>
              item.usuario.toLowerCase() === nomeCompletoTrim.toLowerCase() ||
              item.email.toLowerCase() === emailTrim
          );

          if (usuarioExiste) {
            alert('Usuario ou e-mail ja cadastrado');
            return;
          }

          await criarUsuario(baseUrl, {
            usuario: nomeCompletoTrim,
            nomeCompleto: nomeCompletoTrim,
            email: emailTrim,
            senha,
          });

          cadastroRealizado = true;
          break;
        } catch {
          continue;
        }
      }

      if (!conectouApi) {
        alert('Nao foi possivel conectar ao servidor fake (json-server).');
        return;
      }

      if (!cadastroRealizado) {
        alert('Nao foi possivel concluir o cadastro. Tente novamente.');
        return;
      }

      alert('Conta criada com sucesso!');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome completo"
        placeholderTextColor="#888"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputSenha}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!senhaVisivel}
        />
        <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
          <Feather
            name={senhaVisivel ? 'eye-off' : 'eye'}
            size={20}
            color={senhaVisivel ? '#1e90ff' : '#aaa'}
            style={{ padding: 10 }}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.passwordHint}>Minimo de 8 caracteres.</Text>
      {senha.length > 0 ? (
        <View style={styles.passwordStrengthWrap}>
          <View style={styles.strengthTrack}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${senhaStrength.progress * 100}%`,
                  backgroundColor: senhaStrength.color,
                },
              ]}
            />
          </View>
          <View style={[styles.strengthBadge, { backgroundColor: senhaStrength.color }]}>
            <Text style={styles.strengthBadgeText}>{senhaStrength.label}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.label}>Confirmar senha</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputSenha}
          placeholder="Repita sua senha"
          placeholderTextColor="#888"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!confirmarSenhaVisivel}
        />
        <TouchableOpacity onPress={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}>
          <Feather
            name={confirmarSenhaVisivel ? 'eye-off' : 'eye'}
            size={20}
            color={confirmarSenhaVisivel ? '#1e90ff' : '#aaa'}
            style={{ padding: 10 }}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>

      <Text style={styles.termsText}>
        Ao criar uma conta, voce concorda com os termos de uso e Politica de Privacidade.
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ja tem conta? </Text>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.footerLink}>Entrar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.bottomInfoText}>
        Utilizaremos seus dados para criar sua conta de acesso e enviar informações que te ajudem a
        utilizar o sistema.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordHint: {
    color: '#bbb',
    fontSize: 14,
    marginTop: -6,
    marginBottom: 8,
  },
  passwordStrengthWrap: {
    marginBottom: 14,
  },
  strengthTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2d2d2d',
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  strengthBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  strengthBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  inputSenha: {
    flex: 1,
    color: '#fff',
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F5C227',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#ddd',
    fontSize: 16,
  },
  footerLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    color: '#ddd',
    textAlign: 'center',
    fontSize: 15,
    marginTop: 18,
    lineHeight: 22,
  },
  bottomInfoText: {
    color: '#9f9f9f',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 26,
    lineHeight: 20,
  },
});
