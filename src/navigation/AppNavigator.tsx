import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Telas
import HomeScreen from '../screens/HomeScreen';
import PostScreen from '../screens/PostScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen'; // 👈 adicione aqui

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false}} />
      <Stack.Screen name="Post" component={PostScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const [professorNome, setProfessorNome] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('professorNome').then((nome) => setProfessorNome(nome));
  }, []);

  async function handleLogout() {
    await AsyncStorage.clear();
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>🎓 Blog Educacional</Text>
        {professorNome && <Text style={styles.professorName}>Bem-vindo(a), {professorNome}</Text>}
      </View>
      <DrawerItemList {...props} />
      {professorNome && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      )}
    </DrawerContentScrollView>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Splash" // 👈 começa aqui
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerActiveTintColor: '#007AFF',
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen name="Splash" component={SplashScreen} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="Home" component={HomeStack} options={{ drawerLabel: '🏠 Início' }} />
        <Drawer.Screen name="Login" component={LoginScreen} options={{ drawerLabel: '🔐 Login' }} />
        <Drawer.Screen name="Register" component={RegisterScreen} options={{ drawerLabel: '🧾 Cadastro' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  appTitle: { fontSize: 18, fontWeight: 'bold' },
  professorName: { fontSize: 14, color: '#555', marginTop: 4 },
  logoutBtn: { marginTop: 20, marginHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ddd' },
  logoutText: { color: '#e63946', fontWeight: 'bold', fontSize: 16 },
});
