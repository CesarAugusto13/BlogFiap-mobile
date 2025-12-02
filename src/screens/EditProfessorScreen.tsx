import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfessorScreen({ route, navigation }: any) {
  const { professorId } = route.params;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    async function load() {
      const token = await AsyncStorage.getItem("accessToken");

      const res = await api.get(`/professores/${professorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const p = res.data;
      setNome(p.nome);
      setEmail(p.email);
    }

    load();
  }, []);

  async function salvar() {
    if (!nome || !email)
      return Alert.alert("Atenção", "Preencha os campos obrigatórios.");

    try {
      const token = await AsyncStorage.getItem("accessToken");

      await api.patch(
        `/professores/${professorId}`,
        { nome, email, senha },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Professor atualizado!");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.message || "Falha ao atualizar.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Editar Professor</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha (opcional)"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
