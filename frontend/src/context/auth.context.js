import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, logout as logoutService } from '../services/auth.services';

// Crear el contexto
export const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null indica que está verificando
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

  // Verificar la autenticación al cargar el componente
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Indicar que la verificación ha terminado
      }
    };

    checkAuthentication();
  }, []);

  // Función para iniciar sesión
  const login = async (dataUser) => {
    try {
      const userInfo = await loginService(dataUser); // Simula el servicio de login

      await AsyncStorage.setItem('user', JSON.stringify(userInfo)); // Guarda el usuario en AsyncStorage
      setUser(userInfo);
      setIsAuthenticated(true);
      return userInfo;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Credenciales incorrectas');
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await logoutService(); // Simula el servicio de logout
      await AsyncStorage.removeItem('user'); // Limpia el usuario de AsyncStorage
      await AsyncStorage.removeItem('token'); // Limpia el token de AsyncStorage
      setUser(null);
      setIsAuthenticated(false);
      console.log('Usuario cerró sesión correctamente');
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  };

  // Proveer el contexto con los valores y funciones necesarias
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
