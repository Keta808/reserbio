import React, { useContext, useEffect} from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/login.screen.js'; 
import HomeScreen from '../screens/home.screen.js';
import { AuthContext } from '../context/auth.context';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);
  useEffect(() => {
    console.log('AppNavigator - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]); 

  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
   
  );
};

export default AppNavigator;