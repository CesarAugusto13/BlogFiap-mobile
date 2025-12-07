import React, { useState } from 'react';
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';
import { authEvents } from '../navigation/AppNavigator';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/professores/login", { email, senha });

      const { token, nome, email: emailRetorno } = res.data;

      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("professorNome", nome);
      await AsyncStorage.setItem("professorEmail", emailRetorno);

      // Atualiza drawer
      authEvents.emit("login");

      // Redireciona
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }],
      });

    } catch (err: any) {
      console.log("Login error:", err.response ?? err);

      // ❌ Sem conexão com a internet
      if (err.message === "Network Error") {
        Alert.alert("Erro", "Sem conexão com o servidor. Verifique sua internet.");
        return;
      }

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      // ❌ Credenciais inválidas
      if (status === 401) {
        Alert.alert("Credenciais inválidas", "Email ou senha incorretos.");
        setSenha("");
        return;
      }

      // ❌ Email já cadastrado / validações da API
      if (status === 400) {
        Alert.alert("Atenção", message || "Dados inválidos.");
        return;
      }

      // ❌ Qualquer outro erro
      Alert.alert("Erro", message || "Não foi possível realizar o login.");

    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Login do Professor</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#007AFF', marginTop: 16 },
});
