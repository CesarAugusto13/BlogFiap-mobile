import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import api from "../api/apiClient";

type Professor = {
  _id: string;
  nome: string;
  email: string;
};

export default function ProfessoresListScreen({ navigation }: any) {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [filteredProfessores, setFilteredProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function checkAuth() {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("Acesso negado", "Você precisa estar logado.");
      navigation.navigate("Login");
      return false;
    }
    return true;
  }

  async function loadProfessores() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const res = await api.get("/professores", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data?.data ?? res.data ?? [];
      setProfessores(items);
      setFilteredProfessores(items);
    } catch (err: any) {
      console.error("loadProfessores error:", err?.response ?? err);
      Alert.alert("Erro", "Não foi possível carregar os professores.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      checkAuth();
      loadProfessores();
    }, [])
  );

  /* ------------------------------
      🔍 Filtro de Pesquisa
  ------------------------------ */
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProfessores(professores);
      return;
    }

    const text = query.toLowerCase();

    const filtrados = professores.filter((p) => {
      return (
        p.nome.toLowerCase().includes(text) ||
        p.email.toLowerCase().includes(text)
      );
    });

    setFilteredProfessores(filtrados);
  }, [query, professores]);

  /* ------------------------------
      ❌ Excluir Professor
  ------------------------------ */
  function deleteProfessor(id: string) {
    Alert.alert(
      "Excluir Professor",
      "Tem certeza que deseja excluir este professor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              const token = await AsyncStorage.getItem("accessToken");
              if (!token) {
                Alert.alert("Erro", "Sessão inválida.");
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                return;
              }

              const res = await api.delete(`/professores/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (res.status === 200 || res.status === 204) {
                setProfessores((prev) => prev.filter((p) => p._id !== id));
                setFilteredProfessores((prev) => prev.filter((p) => p._id !== id));
                Alert.alert("Sucesso", "Professor excluído.");
              } else {
                Alert.alert("Erro", "Falha ao excluir.");
              }
            } catch (err: any) {
              console.error("ERRO DELETE:", err?.response ?? err);
              Alert.alert("Erro", "Não foi possível excluir.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍🏫 Professores</Text>

      {/* 🔍 Campo de Busca */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar por nome ou email..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        style={styles.addBtn}
        onPress={() => navigation.navigate("CreateProfessor")}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.addBtnText}>Criar Novo Professor</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredProfessores}
          keyExtractor={(item) => String(item._id)}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Nenhum professor encontrado 😕</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.profName}>{item.nome}</Text>
                <Text style={styles.profEmail}>{item.email}</Text>
              </View>

              <View style={styles.row}>
                <Pressable
                  style={styles.iconBtn}
                  hitSlop={12}
                  onPress={() =>
                    navigation.navigate("EditProfessor", {
                      professorId: item._id,
                    })
                  }
                >
                  <Ionicons name="create-outline" size={22} color="#007AFF" />
                </Pressable>

                <Pressable
                  style={styles.iconBtn}
                  hitSlop={12}
                  onPress={() => deleteProfessor(item._id)}
                  disabled={deletingId === item._id}
                >
                  {deletingId === item._id ? (
                    <ActivityIndicator size="small" color="#FF4444" />
                  ) : (
                    <Ionicons name="trash-outline" size={22} color="#FF4444" />
                  )}
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", paddingTop: 60 },

  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 20 },

  /* 🔍 Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },

  clearBtn: {
    paddingHorizontal: 8,
  },

  clearText: {
    fontSize: 18,
    color: "#888",
  },

  addBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },

  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  card: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profName: { fontSize: 18, fontWeight: "700" },
  profEmail: { fontSize: 14, color: "#555" },

  row: { flexDirection: "row", gap: 14 },

  iconBtn: { padding: 6 },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
