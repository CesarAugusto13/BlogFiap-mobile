import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Post = {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  createdAt: string;
};

export default function AdminPostsScreen({ navigation }: any) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------
     🔐 Verifica login
  ------------------------------ */
  async function checkAuth() {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("Acesso negado", "Você precisa estar logado.");
      navigation.navigate("Login");
    }
  }

  /* ------------------------------
     🔄 Carregar posts
  ------------------------------ */
  async function loadPosts() {
    try {
      setLoading(true);
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar os posts.");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------
     🔥 Atualiza quando volta pra tela
  ------------------------------ */
  useFocusEffect(
    useCallback(() => {
      checkAuth();
      loadPosts();
    }, [])
  );

  /* ------------------------------
     ❌ Excluir Post
  ------------------------------ */
  function deletePost(id: string) {
    Alert.alert("Confirmar", "Deseja realmente excluir este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/posts/${id}`);
            setPosts((prev) => prev.filter((p) => p._id !== id));
            Alert.alert("Sucesso", "Post excluído.");
          } catch (err) {
            Alert.alert("Erro", "Falha ao excluir o post.");
          }
        },
      },
    ]);
  }

  /* ------------------------------
     UI
  ------------------------------ */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠️ Administração de Posts</Text>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("CreatePost")}
      >
        <Text style={styles.addBtnText}>+ Criar Novo Post</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.postTitle}>{item.titulo}</Text>
              <Text style={styles.postAuthor}>Autor: {item.autor}</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("EditPost", { postId: item._id })
                  }
                >
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deletePost(item._id)}
                >
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  addBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    padding: 14,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    elevation: 2,
  },

  postTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 14,
    color: "#555",
  },

  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  editBtn: {
    padding: 8,
    backgroundColor: "#007AFF22",
    borderRadius: 6,
    marginRight: 10,
  },
  editText: {
    color: "#007AFF",
    fontWeight: "700",
  },

  deleteBtn: {
    padding: 8,
    backgroundColor: "#FF444422",
    borderRadius: 6,
  },
  deleteText: {
    color: "#FF4444",
    fontWeight: "700",
  },
});
