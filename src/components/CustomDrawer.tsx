// src/components/CustomDrawer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomDrawer(props: any) {
  const [professor, setProfessor] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('professorNome').then(setProfessor);
  }, []);

  async function handleLogout() {
    await AsyncStorage.clear(); // Remove token e dados do professor

    // Reseta a navegação completamente e leva à tela Login
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }


  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Blog Educacional</Text>
        {professor && <Text style={styles.subtitle}>Olá, {professor}</Text>}
      </View>

      <DrawerItemList {...props} />

      {professor && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      )}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  logoutBtn: { marginTop: 20, padding: 10, alignItems: 'center' },
  logoutText: { color: '#e63946', fontWeight: 'bold' },
});
