import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

      const response = await fetch('http://localhost:3001/usuarios');
      const usuarios: { usuario: string; email: string; senha: string }[] =
        await response.json();

      const loginNormalizado = login.trim().toLowerCase();
      const usuarioEncontrado = usuarios.find((usuario) => {
        const usuarioMatch = usuario.usuario.toLowerCase() === loginNormalizado;
        const emailMatch = usuario.email.toLowerCase() === loginNormalizado;
        const senhaMatch = usuario.senha === senha;
        return senhaMatch && (usuarioMatch || emailMatch);
      });

      if (usuarioEncontrado) {
        await AsyncStorage.setItem('user', 'logado');
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
      <Text style={styles.title}>Bem-vindo!</Text>

      <TextInput
        placeholder="Usuario ou email"
        style={styles.input}
        onChangeText={setLogin}
        value={login}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#888"
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Senha"
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 20,
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
});