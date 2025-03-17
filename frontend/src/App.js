import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native'; 
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/auth.context'; 
import { NavigationContainer } from '@react-navigation/native'; 
import { ThemeProvider } from './context/theme.context'; //  Mantén esta importación
import { MicroempresaProvider } from './context/microempresa.context'; //  Ajusta la ruta si es necesario


export default function App() {
  return (
    console.log("🚀 Iniciando la aplicación..."),
    <NavigationContainer> 
      <AuthProvider>
        <MicroempresaProvider>
          <ThemeProvider> 
            <View style={styles.container}>
              <AppNavigator />
              <StatusBar style="auto" />
            </View> 
          </ThemeProvider>
        </MicroempresaProvider>
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

