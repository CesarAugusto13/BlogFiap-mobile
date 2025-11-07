import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ListRenderItem,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../api/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type RootStackParamList = {
  Home: undefined;
  Post: { postId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Post = {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  curtidas: number;
  createdAt: string;
  updatedAt: string;
};

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingQueryRef = useRef<string>('');
  const isFetchingRef = useRef(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadInitial();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    pendingQueryRef.current = query;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchPosts({ page: 1, restart: true, q: pendingQueryRef.current });
    }, 300);
  }, [query]);

  async function loadInitial() {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    await fetchPosts({ page: 1, restart: true, q: query });
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    await fetchPosts({ page: 1, restart: true, q: query });
    setRefreshing(false);
  }

  type FetchOpts = { page: number; restart?: boolean; q?: string };

  async function fetchPosts({ page, restart = false, q = '' }: FetchOpts) {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await api.get('/posts');
      const data = Array.isArray(res.data) ? res.data : [];
      if (restart) {
        setPosts(data);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newPosts = data.filter((p: any) => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });
      }
      setHasMore(data.length >= PAGE_SIZE);
      setError(null);
    } catch (err: any) {
      console.error('fetchPosts error', err);
      setError(err?.response?.data?.message ?? err.message ?? 'Erro ao carregar posts');
    } finally {
      isFetchingRef.current = false;
    }
  }

  async function loadMore() {
    if (!hasMore || loading || refreshing) return;
    const next = page + 1;
    setPage(next);
    await fetchPosts({ page: next, restart: false, q: query });
  }

  const renderItem: ListRenderItem<Post> = ({ item }) => (
    <PostCard post={item} onPress={() => navigation.navigate('Post', { postId: item._id })} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blog Educacional</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Pesquisar posts..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setPage(1);
              setHasMore(true);
              fetchPosts({ page: 1, restart: true, q: '' });
            }}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error && posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadInitial}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={posts.length === 0 ? styles.flatEmpty : undefined}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={() =>
            isFetchingRef.current && hasMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text>Nenhum post encontrado.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

function PostCard({ post, onPress }: { post: Post; onPress?: () => void }) {
  return (
    <TouchableOpacity style={cardStyles.container} onPress={onPress}>
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.title} numberOfLines={2}>
          {post.titulo}
        </Text>
      </View>
      <Text style={cardStyles.excerpt} numberOfLines={3}>
        {post.conteudo}
      </Text>
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.author}>{post.autor}</Text>
        <Text style={cardStyles.time}>
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  title: { fontSize: 20, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
  },
  clearBtn: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 6 },
  clearText: { color: '#007AFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: 'red', marginBottom: 12, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#007AFF', borderRadius: 5 },
  retryText: { color: '#fff' },
  flatEmpty: { flexGrow: 1 },
  footerLoading: { paddingVertical: 16 },
});

const cardStyles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  excerpt: { fontSize: 14, color: '#444', marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  author: { fontSize: 13, color: '#666' },
  time: { fontSize: 12, color: '#999' },
});
