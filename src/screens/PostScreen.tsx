import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import api from '../api/apiClient'; // axios configurado (baseURL + interceptors)

// Define os tipos de rota (mesmo padrão usado na HomeScreen)
type RootStackParamList = {
  Home: undefined;
  Post: { postId: string | number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Post'>;

type Post = {
  id: string | number;
  title: string;
  content: string;
  author?: { name?: string };
  createdAt?: string;
};

export default function PostScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [postId]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(null);

      // 🔹 Ajuste a rota conforme seu backend:
      // Exemplo: GET /posts/:id
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data);
    } catch (err: any) {
      console.error('Erro ao carregar post:', err);
      setError(err?.response?.data?.message ?? 'Erro ao carregar post.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Post não encontrado.'}</Text>
        <TouchableOpacity onPress={loadPost} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{post.title}</Text>

        <Text style={styles.meta}>
          {post.author?.name ?? 'Autor desconhecido'} •{' '}
          {post.createdAt
            ? format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm")
            : 'Data não informada'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.body}>{post.content}</Text>
      </View>

      <TouchableOpacity
        style={styles.backBtnBottom}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: {
    marginTop: 20,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#222' },
  meta: { fontSize: 13, color: '#777' },
  content: { marginTop: 16 },
  body: { fontSize: 16, lineHeight: 24, color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: 'red', marginBottom: 16, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  backBtnBottom: {
    marginVertical: 24,
    alignSelf: 'flex-start',
  },
  backText: { color: '#007AFF', fontWeight: '600' },
});
