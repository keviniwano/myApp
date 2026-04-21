import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Planos() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planos</Text>
      <Text style={styles.subtitle}>Aqui vamos gerenciar os planos.</Text>

      <Pressable style={styles.button} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>Voltar para Inicio</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    justifyContent: 'center',
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
  button: {
    backgroundColor: '#F5C227',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
