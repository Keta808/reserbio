import React, { createContext, useContext, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';  // Importar AsyncStorage
import { login as loginService, logout as logoutService } from '../services/auth.services'; 

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => { 
   

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
      const checkAuthentication = async () => {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
              console.log('User authenticated:', JSON.parse(storedUser));
          } else {
              setIsAuthenticated(false);
              console.log('No user found, not authenticated');
          }
      };

      checkAuthentication();
  }, []);
     
    

    const login = async (dataUser) => {
        try {
            const userInfo = await loginService(dataUser);
            setUser(userInfo);
            setIsAuthenticated(true);
            console.log('Usuario inició sesión:', userInfo); 
            return userInfo;
          } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            throw error; 
          }
    };

    const logout = async () => {
        try {
            await logoutService();
            setUser(null);
            setIsAuthenticated(false);
            console.log('Usuario cerró sesión correctamente');
          } catch (error) {
            console.error('Error durante el cierre de sesión:', error);
          }
    };

    return (
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
};
