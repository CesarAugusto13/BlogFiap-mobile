import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EventEmitter } from 'eventemitter3';

import AdminPostsScreen from '../screens/AdminPostsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PostScreen from '../screens/PostScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';

import ProfessoresListScreen from '../screens/ProfessoresListScreen';
import CreateProfessorScreen from '../screens/CreateProfessorScreen';
import EditProfessorScreen from '../screens/EditProfessorScreen';

export const authEvents = new EventEmitter();

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

/* ---------------------------
   HOME STACK
------------------------------ */
function HomeStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Início",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={{ fontSize: 22, marginLeft: 10 }}>☰</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen name="Post" component={PostScreen} options={{ title: "Post", headerShown: true }} />
    </Stack.Navigator>
  );
}

/* ---------------------------
   POSTS ADMIN STACK
------------------------------ */
function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminPosts"
        component={AdminPostsScreen}
        options={({ navigation }) => ({
          title: "Administração",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={{ fontSize: 22, marginLeft: 10 }}>☰</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen name="EditPost" component={EditPostScreen} options={{ title: "Editar Post", headerShown: true }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: "Criar Post", headerShown: true }} />
    </Stack.Navigator>
  );
}

/* ---------------------------
   PROFESSORES STACK (NOVO)
------------------------------ */
function ProfessoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfessoresList"
        component={ProfessoresListScreen}
        options={({ navigation }) => ({
          title: "Professores",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={{ fontSize: 22, marginLeft: 10 }}>☰</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen name="CreateProfessor" component={CreateProfessorScreen} options={{ title: "Criar Professor", headerShown: true }} />
      <Stack.Screen name="EditProfessor" component={EditProfessorScreen} options={{ title: "Editar Professor", headerShown: true }} />
    </Stack.Navigator>
  );
}

/* ---------------------------
   CUSTOM DRAWER
------------------------------ */
function CustomDrawerContent(props) {
  const [professorNome, setProfessorNome] = useState(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const nome = await AsyncStorage.getItem("professorNome");
        setProfessorNome(nome);
      }
      load();
    }, [])
  );

  async function handleLogout() {
    await AsyncStorage.clear();
    setProfessorNome(null);

    authEvents.emit("login");

    props.navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>🎓 Blog Educacional</Text>

        <Text style={styles.professorName}>
          {professorNome ? `Bem-vindo(a), ${professorNome}` : "Bem-vindo(a), Estudante"}
        </Text>
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

/* ---------------------------
   MAIN APP NAVIGATOR
------------------------------ */
export default function AppNavigator() {
  const [professorLogado, setProfessorLogado] = React.useState(false);

  React.useEffect(() => {
    async function checkLogin() {
      const nome = await AsyncStorage.getItem("professorNome");
      setProfessorLogado(!!nome);
    }

    checkLogin();
    authEvents.on("login", checkLogin);

    return () => {
      authEvents.off("login", checkLogin);
    };
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Splash"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: "#007AFF",
          drawerLabelStyle: { fontSize: 16 },
        }}
      >

        <Drawer.Screen name="Splash" component={SplashScreen} options={{ drawerItemStyle: { height: 0 } }} />

        <Drawer.Screen name="HomeScreen" component={HomeStack} options={{ drawerLabel: "🏠 Início" }} />

        <Drawer.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            drawerLabel: "🔐 Login",
            headerShown: true,
            title: "Login",
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Text style={{ fontSize: 22, marginLeft: 10 }}>☰</Text>
              </TouchableOpacity>
            ),
          })}
        />

        <Drawer.Screen
          name="Register"
          component={RegisterScreen}
          options={({ navigation }) => ({
            drawerLabel: "🧾 Cadastro",
            headerShown: true,
            title: "Cadastro",
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Text style={{ fontSize: 22, marginLeft: 10 }}>☰</Text>
              </TouchableOpacity>
            ),
          })}
        />

        {/* 🔐 Disponível apenas quando logado */}
        {professorLogado && (
          <>
            <Drawer.Screen
              name="Admin"
              component={AdminStack}
              options={{ drawerLabel: "🛠 Administração de Posts" }}
            />

            <Drawer.Screen
              name="Professores"
              component={ProfessoresStack}
              options={{ drawerLabel: "👨‍🏫 Professores" }}
            />
          </>
        )}

      </Drawer.Navigator>
    </NavigationContainer>
  );
}

/* ---------------------------
   STYLES
------------------------------ */
const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  professorName: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  logoutBtn: {
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  logoutText: {
    color: "#e63946",
    fontWeight: "bold",
    fontSize: 16,
  },
});
