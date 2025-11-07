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
  Animated,
  Easing,
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
    <AnimatedPostCard post={item} onPress={() => navigation.navigate('Post', { postId: item._id })} />
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho bonito */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>Explore ideias e compartilhe conhecimento</Text>
      </View>

      {/* Campo de busca */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="🔍 Buscar posts..."
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
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de posts */}
      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
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
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={posts.length === 0 ? styles.flatEmpty : undefined}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhum post encontrado 😕</Text>
            </View>
          )}
          ListFooterComponent={() =>
            isFetchingRef.current && hasMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

/* ------------------- CARD COM ANIMAÇÃO SUAVE ------------------- */
function AnimatedPostCard({ post, onPress }: { post: Post; onPress?: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[cardStyles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Text style={cardStyles.title}>{post.titulo}</Text>
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
    </Animated.View>
  );
}

/* ---------------------------- ESTILOS ---------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#222' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  clearBtn: { marginLeft: 6 },
  clearText: { fontSize: 18, color: '#888' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 10 },
  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#555', fontSize: 16 },
  flatEmpty: { flexGrow: 1 },
  footerLoading: { paddingVertical: 16 },
});

const cardStyles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 6 },
  excerpt: { fontSize: 14, color: '#444', marginBottom: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: 13, color: '#007AFF', fontWeight: '500' },
  time: { fontSize: 12, color: '#999' },
});
