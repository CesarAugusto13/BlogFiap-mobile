import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminProfessoresScreen() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [editando, setEditando] = useState(null); // null = criando, {} = editando
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function loadProfessores() {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await api.get("/professores", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfessores(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível carregar os professores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfessores();
  }, []);

  async function salvarProfessor() {
    if (!nome.trim() || !email.trim() || (!editando && !senha.trim())) {
      return Alert.alert("Atenção", "Preencha todos os campos.");
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (editando) {
        await api.patch(
          `/professores/${editando._id}`,
          { nome, email, senha },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Sucesso", "Professor atualizado!");
      } else {
        await api.post(
          "/professores/register",
          { nome, email, senha },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Sucesso", "Professor criado!");
      }

      setModalVisible(false);
      setEditando(null);
      setNome("");
      setEmail("");
      setSenha("");

      loadProfessores();
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.message || "Falha ao salvar.");
    }
  }

  async function excluirProfessor(id) {
    Alert.alert("Excluir", "Deseja realmente excluir?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("accessToken");
            await api.delete(`/professores/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            loadProfessores();
          } catch (err) {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
        style: "destructive",
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍🏫 Administração de Professores</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditando(null);
          setNome("");
          setEmail("");
          setSenha("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>➕ Novo Professor</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={professores}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <Text style={styles.cardEmail}>{item.email}</Text>

              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setEditando(item);
                    setNome(item.nome);
                    setEmail(item.email);
                    setSenha("");
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => excluirProfessor(item._id)}
                >
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editando ? "Editar Professor" : "Criar Professor"}
            </Text>

            <TextInput
              placeholder="Nome"
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Senha"
              style={styles.input}
              value={senha}
              secureTextEntry
              onChangeText={setSenha}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={salvarProfessor}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardName: { fontSize: 18, fontWeight: "bold" },
  cardEmail: { fontSize: 14, color: "#555" },
  cardButtons: { flexDirection: "row", marginTop: 10 },
  editBtn: { marginRight: 20 },
  editText: { color: "#007AFF", fontWeight: "600" },
  deleteBtn: {},
  deleteText: { color: "#e63946", fontWeight: "600" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  cancelBtn: { padding: 10 },
  cancelText: { textAlign: "center", color: "#555" },
});
