import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!login || !senha) {
      alert('Preencha usuario/email e senha');
      return;
    }

    try {
      setLoading(true);

      const urls = getApiBaseUrls();
      let usuarios: Usuario[] | null = null;

      for (const baseUrl of urls) {
        try {
          const response = await fetch(`${baseUrl}/usuarios`);
          if (!response.ok) continue;
          usuarios = await response.json();
          break;
        } catch {
          continue;
        }
      }

      if (!usuarios) {
        throw new Error('API indisponivel');
      }

      const loginNormalizado = login.trim().toLowerCase();
      const usuarioEncontrado = usuarios.find((usuario) => {
        const usuarioMatch = usuario.usuario.toLowerCase() === loginNormalizado;
        const emailMatch = usuario.email.toLowerCase() === loginNormalizado;
        const senhaMatch = usuario.senha === senha;
        return senhaMatch && (usuarioMatch || emailMatch);
      });

      if (usuarioEncontrado) {
        const nome = usuarioEncontrado.nomeCompleto || usuarioEncontrado.usuario;
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            id: usuarioEncontrado.id,
            nome,
            email: usuarioEncontrado.email,
            usuario: usuarioEncontrado.usuario,
          })
        );
        router.push('/home');
        return;
      }

      alert('Login inválido');
    } catch {
      alert('Nao foi possivel conectar ao servidor fake (json-server).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Identifique-se</Text>
      <Text style={styles.subtitle}>Digite seu e-mail e senha</Text>

      <Text style={styles.emailLabel}>E-mail</Text>
      <TextInput
        placeholder="kevin@uniaraxa.com"
        style={styles.input}
        onChangeText={setLogin}
        value={login}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#888"
      />

      <View style={styles.senhaHeader}>
        <Text style={styles.senhaLabel}>Senha</Text>
        <TouchableOpacity onPress={() => alert('Funcionalidade em desenvolvimento')}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Digite sua senha"
          style={styles.inputSenha}
          onChangeText={setSenha}
          value={senha}
          placeholderTextColor="#888"
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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Primeiro login? </Text>
        <TouchableOpacity onPress={() => router.push('/cadastro')}>
          <Text style={styles.signupLink}>Criar conta</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  emailLabel: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 20,
  },
  senhaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senhaLabel: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '600',
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '600',
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
    marginTop: 10,
    shadowColor: '#F5C227',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    marginTop: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#ddd',
    fontSize: 18,
  },
  signupLink: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});