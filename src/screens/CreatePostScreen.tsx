import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import api from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreatePostScreen({ navigation }: any) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreatePost() {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      // 🔥 BUSCA AUTOMATICAMENTE O NOME DO PROFESSOR LOGADO
      const autor = await AsyncStorage.getItem("professorNome");

      if (!autor) {
        Alert.alert("Erro", "Não foi possível identificar o autor. Faça login novamente.");
        navigation.navigate("Login");
        return;
      }

      // 🔥 ENVIA O AUTOR NO POST
      await api.post("/posts", {
        titulo,
        conteudo,
        autor,
      });

      Alert.alert("Sucesso", "Post criado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", error.response?.data?.message || "Falha ao criar post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📝 Criar Novo Post</Text>

        <TextInput
          style={styles.input}
          placeholder="Título do post"
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conteúdo do post"
          value={conteudo}
          onChangeText={setConteudo}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreatePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Criar Post</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------
   🔹 Styles
------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
    marginBottom: 15,
  },
  textArea: {
    height: 160,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
    marginTop: 25,
    alignItems: "center",
  },
  backText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
