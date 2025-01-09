import React, { useContext } from 'react';

import { createStackNavigator } from '@react-navigation/stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/login.screen.js'; 
import HomeScreen from '../screens/home.screen.js';
import SuscripcionScreen from '../screens/suscripcion.screen.js';
import MicroempresaInicioScreeen from '../screens/microempresa.screen.js';
import FormularioMicroempresa from '../screens/formularioMicroempresa.screen.js';

import PaymentScreen from '../screens/pago.screen.js';
import { AuthContext } from '../context/auth.context';

const Stack = createStackNavigator(); 
const Tab = createBottomTabNavigator();

const HomeNavigator = () => {
  

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Suscripcion" component={SuscripcionScreen} />
      <Tab.Screen name="Microempresa" component={MicroempresaInicioScreeen} />
      <Tab.Screen name="FormularioMicroempresa" component={FormularioMicroempresa} />
      
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);


  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
          <Stack.Screen name="HomeNavigator" component={HomeNavigator} /> 
          <Stack.Screen name="Pago" component={PaymentScreen}  />
          
          </>
          
          

        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
   
  );
};

export default AppNavigator;