import React, { useContext } from 'react';

import { createStackNavigator } from '@react-navigation/stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// SEPARAR PANTALLAS POR TIPOS DE USUARIOS Y PRIVILEGIOS

import MicroempresaInicioScreeen from '../screens/microempresa.screen.js';
import FormularioMicroempresa from '../screens/formularioMicroempresa.screen.js';
import DisponibilidadScreen from '../screens/disponibilidad.screen.js';
import FormularioCreacionHorasScreen from '../screens/formularioCreacionHorario.screen.js'; // Corregido
import SeleccionMicroempresaScreen from '../screens/seleccionMicroempresa.screen.js';
// PANTALLAS COMUNES (TODOS LOS USARIOS LAS PUEDEN VER)
import SuscripcionScreen from '../screens/suscripcion.screen.js';
import PaymentScreen from '../screens/pago.screen.js'; 
import LoginScreen from '../screens/login.screen.js'; 
import HomeScreen from '../screens/home.screen.js';

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
      <Tab.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} />
      <Tab.Screen name="Disponibilidad" component={DisponibilidadScreen} />
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
          <Stack.Screen name="FormularioCreacionHoras" component={FormularioCreacionHorasScreen} />
          <Stack.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} />
          </>
          
          

      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
