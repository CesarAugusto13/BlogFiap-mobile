import api from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function registerProfessor(nome: string, email: string, senha: string) {
  try {
    const res = await api.post('/auth/register', { nome, email, senha });
    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Erro ao registrar professor');
  }
}

// 🔐 Login
export async function loginProfessor(email: string, senha: string) {
  try {
    const res = await api.post('/auth/login', { email, senha });
    const { token, nome, email: emailRetorno } = res.data;

    if (token) {
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('professorNome', nome);
      await AsyncStorage.setItem('professorEmail', emailRetorno);
    }

    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Erro ao efetuar login');
  }
}

export async function logoutProfessor() {
  await AsyncStorage.multiRemove(['accessToken', 'professorNome', 'professorEmail']);
}
