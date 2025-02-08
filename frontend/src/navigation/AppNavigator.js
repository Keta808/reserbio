import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/root.services.js';
import { useTheme } from '../context/theme.context';

// Importar pantallas
import MicroempresaInicioScreeen from '../screens/microempresa.screen.js';
import FormularioMicroempresa from '../screens/formularioMicroempresa.screen.js';
import SubirFotoPerfilScreen from '../screens/subidaFotoPerfil.screen.js';
import SubirImagenesScreen from '../screens/subidaImagenes.screen.js';
import FormularioEdicionMicroempresa from '../screens/formularioEdicionMicroempresa.screen.js';
import ListaMicroempresasScreen from '../screens/listaMicroempresas.screen.js';
import PerfilTrabajadorScreen from '../screens/perfilTrabajador.screen.js';
import DisponibilidadScreen from '../screens/disponibilidad.screen.js';
import FormularioCreacionHorasScreen from '../screens/formularioCreacionHorario.screen.js';
import SeleccionMicroempresaScreen from '../screens/seleccionMicroempresa.screen.js';
import SuscripcionScreen from '../screens/suscripcion.screen.js';
import PaymentScreen from '../screens/pago.screen.js';
import LoginScreen from '../screens/login.screen.js';
import CalendarScreen from '../screens/calendario.screen.js'; 
import HomeClienteScreen from '../screens/homeCliente.screen.js';
import MicroempresaClienteScreen from '../screens/microempresaCliente.screen.js';
import SeleccionServicioScreen from '../screens/seleccionServicio.screen.js';
import InvitarTrabajadorScreen from '../screens/invitarTrabajadores.screen.js';
import ResponderInvitacionScreen from '../screens/responderInvitacion.screen.js';

// Pantallas para Trabajador
import gestorSuscripcionScreen from '../screens/gestorSuscripcion.screen.js'; 
import CardForm from '../screens/cardForm.screen.js'; 
import TrabajadorScreen from '../screens/trabajador.screen.js';
import HomeTrabajadorScreen from '../screens/homeTrabajador.screen.js';

// Contexto de autenticación
import { AuthContext } from '../context/auth.context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ color: theme.text }}>Verificando autenticación...</Text>
    </View>
  );
};

const HomeClienteNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.primary,
      }}
    >
      <Tab.Screen name="HomeCliente" component={HomeClienteScreen} />
      <Tab.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />
    </Tab.Navigator>
  );
};

const HomeTrabajadorNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.primary,
      }}
    >
      <Tab.Screen name="HomeTrabajador" component={HomeTrabajadorScreen} />
      <Tab.Screen name="Suscripcion" component={SuscripcionScreen} />
      <Tab.Screen name="FormularioMicroempresa" component={FormularioMicroempresa} />
      <Tab.Screen name="SubirFotoPerfil" component={SubirFotoPerfilScreen} />
      <Tab.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} />
      <Tab.Screen name="Horario" component={DisponibilidadScreen} />
      <Tab.Screen name="Calendario" component={CalendarScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { setIsAuthenticated, isAuthenticated, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando el token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setIsAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const ClienteStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeNavigator" component={HomeClienteNavigator} />
      <Stack.Screen name="MicroempresaCliente" component={MicroempresaClienteScreen} />
      <Stack.Screen name="SeleccionServicio" component={SeleccionServicioScreen} />
    </Stack.Navigator>
  );

  const TrabajadorStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeNavigator" component={HomeTrabajadorNavigator} />
      <Stack.Screen name="Pago" component={PaymentScreen} />
      <Stack.Screen name="FormularioCreacionHoras" component={FormularioCreacionHorasScreen} />
      <Stack.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} />
      <Stack.Screen name="GestorSuscripcion" component={gestorSuscripcionScreen} />
      <Stack.Screen name="CardForm" component={CardForm} />
      <Stack.Screen name="Microempresa" component={MicroempresaInicioScreeen} />
      <Stack.Screen name="EditarMicroempresa" component={FormularioEdicionMicroempresa} />
      <Stack.Screen name="SubirImagenes" component={SubirImagenesScreen} />
      <Stack.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />
      <Stack.Screen name="Trabajador" component={PerfilTrabajadorScreen} />
      <Stack.Screen name="Perfil" component={TrabajadorScreen} />
      <Stack.Screen name="InvitarTrabajador" component={InvitarTrabajadorScreen} />
      <Stack.Screen name="ResponderInvitacion" component={ResponderInvitacionScreen} />
    </Stack.Navigator>
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        user?.kind === 'Cliente' ? (
          <Stack.Screen name="Cliente" component={ClienteStack} />
        ) : (
          <Stack.Screen name="Worker" component={TrabajadorStack} />
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
