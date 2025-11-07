import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../api/apiClient';

type Comentario = {
  conteudo: string;
};

type Post = {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  curtidas: number;
  comentarios: Comentario[];
  createdAt: string;
  updatedAt: string;
};

export default function PostScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comentario[]>([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadPost();
    checkIfLiked();
  }, [postId]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data);
      setComments(res.data.comentarios || []);
    } catch (err: any) {
      console.error('Erro ao carregar post:', err);
      setError('Erro ao carregar post.');
    } finally {
      setLoading(false);
    }
  }

  async function checkIfLiked() {
    try {
      const likedPostsJSON = await AsyncStorage.getItem('likedPosts');
      const likedPosts: string[] = likedPostsJSON ? JSON.parse(likedPostsJSON) : [];
      setLiked(likedPosts.includes(postId));
    } catch (err) {
      console.error('Erro ao verificar curtidas locais:', err);
    }
  }

  async function handleLike() {
    if (liked || !post) return;

    try {
      await api.patch(`/posts/${post._id}/curtir`);

      setPost((prev) => (prev ? { ...prev, curtidas: prev.curtidas + 1 } : prev));
      setLiked(true);

      const likedPostsJSON = await AsyncStorage.getItem('likedPosts');
      const likedPosts: string[] = likedPostsJSON ? JSON.parse(likedPostsJSON) : [];
      likedPosts.push(postId);
      await AsyncStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (err) {
      console.error('Erro ao curtir o post:', err);
      Alert.alert('Erro', 'Não foi possível curtir o post.');
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !post) return;

    try {
      const response = await api.post(`/posts/${post._id}/comentarios`, {
        conteudo: newComment,
      });
      const newComent: Comentario = response.data;

      setComments((prev) => [...prev, newComent]);
      setNewComment('');
    } catch (err) {
      console.error('Erro ao comentar:', err);
      Alert.alert('Erro', 'Não foi possível adicionar o comentário.');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 8 }}>Carregando post...</Text>
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
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Card do Post */}
        <View style={styles.postCard}>
          <Text style={styles.title}>{post.titulo}</Text>
          <Text style={styles.meta}>
            ✍️ {post.autor} ·{' '}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
          </Text>

          <Text style={styles.content}>{post.conteudo}</Text>

          <TouchableOpacity
            onPress={handleLike}
            disabled={liked}
            style={[styles.likeBtn, liked && styles.likeBtnDisabled]}
          >
            <Text style={[styles.likeText, liked && { color: '#999' }]}>
              {liked ? `❤️ Curtido (${post.curtidas})` : `🤍 Curtir (${post.curtidas})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção de comentários */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>💬 Comentários</Text>

          {comments.length > 0 ? (
            comments.map((c, i) => (
              <View key={i} style={styles.commentCard}>
                <Text style={styles.commentText}>{c.conteudo}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>Nenhum comentário ainda. Seja o primeiro! ✨</Text>
          )}
        </View>

        {/* Campo de novo comentário */}
        <View style={styles.newCommentContainer}>
          <TextInput
            placeholder="Escreva um comentário..."
            value={newComment}
            onChangeText={setNewComment}
            style={styles.commentInput}
            multiline
          />
          <TouchableOpacity onPress={handleAddComment} style={styles.commentBtn}>
            <Text style={styles.commentBtnText}>Enviar 💬</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ----------------------- ESTILOS ----------------------- */
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  backBtn: { marginBottom: 12 },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  errorText: { color: 'red', marginBottom: 12, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  meta: { fontSize: 14, color: '#666', marginBottom: 16 },
  content: { fontSize: 16, color: '#333', lineHeight: 22, marginBottom: 20 },
  likeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F0FE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  likeBtnDisabled: { backgroundColor: '#F1F1F1' },
  likeText: { color: '#007AFF', fontWeight: '600' },

  commentsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  commentsTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 10 },
  commentCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  commentText: { fontSize: 15, color: '#333', lineHeight: 20 },
  noComments: { color: '#999', fontSize: 14, textAlign: 'center', marginVertical: 10 },

  newCommentContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  commentBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  commentBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
