import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PostScreen from '../screens/PostScreen'; // se quiser depois

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Página Inicial' }}
        />
        <Stack.Screen 
          name="Post" 
          component={PostScreen}
          options={{ title: 'Detalhes do Post' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
