import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bem-vindo 🚀</Text>

      <Button title="Sair" onPress={() => router.push('/login')} />
    </View>
  );
}