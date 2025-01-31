import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/root.services.js';

// Importar pantallas
import MicroempresaInicioScreeen from '../screens/microempresa.screen.js';
import FormularioMicroempresa from '../screens/formularioMicroempresa.screen.js';
import FormularioEdicionMicroempresa from '../screens/formularioEdicionMicroempresa.screen.js';
import ListaMicroempresasScreen from '../screens/listaMicroempresas.screen.js';
import PerfilTrabajadorScreen from '../screens/perfilTrabajador.screen.js';
import DisponibilidadScreen from '../screens/disponibilidad.screen.js';
import FormularioCreacionHorasScreen from '../screens/formularioCreacionHorario.screen.js';
import SeleccionMicroempresaScreen from '../screens/seleccionMicroempresa.screen.js';
import SuscripcionScreen from '../screens/suscripcion.screen.js';
import PaymentScreen from '../screens/pago.screen.js';
import LoginScreen from '../screens/login.screen.js';
import HomeScreen from '../screens/home.screen.js';
import CalendarScreen from '../screens/calendario.screen.js'; 
import HomeClienteScreen from '../screens/homeCliente.screen.js';
import MicroempresaClienteScreen from '../screens/microempresaCliente.screen.js';
import SeleccionServicioScreen from '../screens/seleccionServicio.screen.js';
import ConfirmacionReservaScreen from '../screens/confirmacionReserva.screen.js';
import TestScreen from '../screens/testimagenes.screen.js';
import ReservaClienteScreen from '../screens/reservasCliente.screen.js';

// Pantallas para Trabajador
import gestorSuscripcionScreen from '../screens/gestorSuscripcion.screen.js'; 
import CardForm from '../screens/cardForm.screen.js'; 
// Contexto de autenticación
import { AuthContext } from '../context/auth.context';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text>Verificando autenticación...</Text>
  </View>
);

const HomeNavigator = () => (
  <Tab.Navigator lazy={true}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Suscripcion" component={SuscripcionScreen} />
    <Tab.Screen name="FormularioMicroempresa" component={FormularioMicroempresa} />
    <Tab.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} />
    <Tab.Screen name="Horario" component={DisponibilidadScreen} />
    <Tab.Screen name="Calendario" component={CalendarScreen} />
   
  </Tab.Navigator>
);

const HomeClienteNavigator = () => (
 <Tab.Navigator lazy={true}>
    <Tab.Screen name="HomeCliente" component={HomeClienteScreen} />
    <Tab.Screen name ="Test" component={TestScreen} />  
    <Tab.Screen name="Reservas" component={ReservaClienteScreen} />
    
  </Tab.Navigator>
);


const AppNavigator = () => {
  const { setIsAuthenticated, isAuthenticated ,user} = useContext(AuthContext); // Asumimos que el contexto tiene este método
  const [isLoading, setIsLoading] = useState(true); // Estado de carga local

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Recuperar el token desde AsyncStorage
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Configurar axios con el token recuperado
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true); // Establecer como autenticado en el contexto
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando el token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Finalizar carga
      }
    };

    checkAuth(); // Ejecutar la verificación al montar el componente
  }, [setIsAuthenticated]);

  if (isLoading) {
    // Mostrar pantalla de carga mientras se verifica la autenticación
    return <LoadingScreen />;
  }

  const ClienteStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeNavigator" component={HomeClienteNavigator} />
      <Stack.Screen name ="ListaMicroempresas" component={ListaMicroempresasScreen} />  
      <Stack.Screen name="MicroempresaCliente" component={MicroempresaClienteScreen} />
      <Stack.Screen name="SeleccionServicio" component={SeleccionServicioScreen} />
      <Stack.Screen name="ConfirmacionReserva" component={ConfirmacionReservaScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
  
  const TrabajadorStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
      <Stack.Screen name="Pago" component={PaymentScreen} />
      <Stack.Screen name="FormularioCreacionHoras" component={FormularioCreacionHorasScreen} />
      <Stack.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} /> 
      <Stack.Screen name="GestorSuscripcion" component={gestorSuscripcionScreen} /> 
      <Stack.Screen name="CardForm" component={CardForm} />
      <Stack.Screen name="Microempresa" component={MicroempresaInicioScreeen} />
      <Stack.Screen name="EditarMicroempresa" component={FormularioEdicionMicroempresa} />
      <Stack.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />
      <Stack.Screen name="Trabajador" component={PerfilTrabajadorScreen} />
   
    
    </Stack.Navigator>
  );
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        (() => {
          console.log('Valor de user:', user); // Verifica si `user` existe y muestra su contenido
          console.log('Valor de user.kind:', user?.kind); // Verifica el valor de `kind`
          return user?.kind === 'Cliente' ? ( 
            <Stack.Screen name="Cliente" component={ClienteStack} />
          ) : (
            <Stack.Screen name="Worker" component={TrabajadorStack} />
          );
        })()
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;