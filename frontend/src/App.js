import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native'; 
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/auth.context'; 
import { NavigationContainer } from '@react-navigation/native'; // ❌ Elimina ThemeProvider aquí
import { ThemeProvider } from './context/theme.context'; // ✅ Mantén esta importación

export default function App() {
  console.log('App - Rendering');
  return (
    <NavigationContainer> 
      <AuthProvider>
        <ThemeProvider> 
          <View style={styles.container}>
            <AppNavigator />
            <StatusBar style="auto" />
          </View> 
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

