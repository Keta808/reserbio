import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/root.services.js';
import { useMicroempresa } from "../context/microempresa.context";

// Importar pantallas
import MicroempresaInicioScreeen from '../screens/microempresa.screen.js';
import FormularioMicroempresa from '../screens/formularioMicroempresa.screen.js';
import SubirFotoPerfilScreen from '../screens/subidaFotoPerfil.screen.js';
import SubirImagenesScreen from '../screens/subidaImagenes.screen.js';
import FormularioEdicionMicroempresa from '../screens/formularioEdicionMicroempresa.screen.js';
import ListaMicroempresasScreen from '../screens/listaMicroempresas.screen.js';
import PerfilTrabajadorScreen from '../screens/perfilTrabajador.screen.js';
import SeleccionMicroempresaScreen from '../screens/seleccionMicroempresa.screen.js';
import SuscripcionScreen from '../screens/suscripcion.screen.js';
import PaymentScreen from '../screens/pago.screen.js';
import LoginScreen from '../screens/login.screen.js';
import RegistroClienteScreen from '../screens/registroClientes.screen.js';
import CalendarScreen from '../screens/calendario.screen.js'; 
import HomeClienteScreen from '../screens/homeCliente.screen.js';
import MicroempresaClienteScreen from '../screens/microempresaCliente.screen.js';
import SeleccionServicioScreen from '../screens/seleccionServicio.screen.js';
import ReservaClienteScreen from '../screens/reservasCliente.screen.js';
import ValoracionServicioScreen from '../screens/valoracion.screen.js';
import AceptarInvitacionScreen from '../screens/aceptarInvitacionScreen.js';
import PerfilClienteScreen from '../screens/perfilCliente.screen.js';

// Pantallas para Trabajador
import gestorSuscripcionScreen from '../screens/gestorSuscripcion.screen.js'; 
import CardScreen from '../screens/cardForm.screen.js'; 
import TrabajadorScreen from '../screens/trabajador.screen.js';
import HomeTrabajadorScreen from '../screens/homeTrabajador.screen.js';
import ServicioScreen from '../screens/servicio.screen.js';
import MercadoPagoScreen from '../screens/mercadopago.screen.js';
import ServicioPaymentScreen from '../screens/servicioPayment.screen.js'; 

// Otras pantallas
import Horario from '../screens/horario.screen.js';
import EditarHorarioScreen from '../screens/editarHorarioScreen.js';
import ConfirmacionReservaSlotScreen from '../screens/confirmacionReservaSlot.screen.js';
import InvitarTrabajadorScreen from '../screens/invitarTrabajadores.screen.js';
import NoMicroempresaScreen from '../screens/noMicroempresa.screen.js';

// Contexto de autenticación y tema
import { AuthContext } from '../context/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/theme.context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text>Verificando autenticación...</Text>
  </View>
);

// Calculamos colores de contraste para header y tabBar según el tema principal.
const getContrastColor = (background) =>
  background === "#FFFFFF" ? "#F0F0F0" : "#222222";

// Configuramos el Tab Navigator para Cliente sin header (se usará el header global del AppNavigator)
const HomeClienteNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === "HomeCliente") {
            iconName = "home"; 
          } else if (route.name === "ListaMicroempresas") {
            iconName = "list"; 
          } else if (route.name === "Reservas") {
            iconName = "calendar"; 
          } else if (route.name === "Perfil") {
            iconName = "person"; 
          } else if (route.name === "Suscripcion") {
            iconName = "card"; 
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
          backgroundColor: getContrastColor(theme.background),
        },
        tabBarItemStyle: styles.tabBarItemStyle,
        safeAreaInsets: { bottom: 0 },
        headerShown: false,
      })}
    > 
      <Tab.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />
      <Tab.Screen name="HomeCliente" component={HomeClienteScreen} />
      <Tab.Screen name="Reservas" component={ReservaClienteScreen} /> 
      <Tab.Screen name="Perfil" component={PerfilClienteScreen} />
      <Tab.Screen name="Suscripcion" component={SuscripcionScreen} />
    </Tab.Navigator>
  );
};

const HomeTrabajadorNavigator = () => {
  const { microempresa } = useMicroempresa();
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === "HomeTrabajador") {
            iconName = "home"; 
          } else if (route.name === "Calendario") {
            iconName = "calendar"; 
          } else if (route.name === "Microempresa") {
            iconName = "briefcase"; 
          } else if (route.name === "Perfil") {
            iconName = "person";
          } else if (route.name === "Horario") {
            iconName = "time"; 
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
          backgroundColor: getContrastColor(theme.background),
        },
        tabBarItemStyle: styles.tabBarItemStyle,
        safeAreaInsets: { bottom: 0 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTrabajador" component={HomeTrabajadorScreen} />  
      <Tab.Screen name="Calendario" component={CalendarScreen} />
      <Tab.Screen 
        name="Microempresa" 
        component={MicroempresaInicioScreeen} 
        initialParams={microempresa?._id ? { id: microempresa._id } : undefined}
      />
      <Tab.Screen name="Perfil" component={TrabajadorScreen} />
      <Tab.Screen name="Horario" component={Horario} /> 
    </Tab.Navigator>
  );
};

// En este caso, queremos un único header global, por lo que en los stacks anidados
// (ClienteStack y TrabajadorStack) se oculta el header, de modo que el header global del AppNavigator sea el único visible.
const TrabajadorStack = () => {
  const { microempresa, isAdmin, loading } = useMicroempresa();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando información...</Text>
      </View>
    );
  }

  let initialRoute;
  if (isAdmin) {
    initialRoute = microempresa ? "HomeNavigator" : "FormularioMicroempresa";
  } else {
    initialRoute = microempresa ? "HomeNavigator" : "NoMicroempresaScreen";
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="FormularioMicroempresa" component={FormularioMicroempresa} />
      <Stack.Screen name="HomeNavigator" component={HomeTrabajadorNavigator} />
      <Stack.Screen name="NoMicroempresaScreen" component={NoMicroempresaScreen} />
      <Stack.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} /> 
      <Stack.Screen name="GestorSuscripcion" component={gestorSuscripcionScreen} /> 
      <Stack.Screen name="CardScreen" component={CardScreen} />
      <Stack.Screen name="Microempresa" component={MicroempresaInicioScreeen} />
      <Stack.Screen name="InvitarTrabajador" component={InvitarTrabajadorScreen} />
      <Stack.Screen name="EditarMicroempresa" component={FormularioEdicionMicroempresa} />
      <Stack.Screen name="SubirFotoPerfil" component={SubirFotoPerfilScreen} />
      <Stack.Screen name="SubirImagenes" component={SubirImagenesScreen} />
      <Stack.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />
      <Stack.Screen name="Trabajador" component={PerfilTrabajadorScreen} /> 
      <Stack.Screen name="Perfil" component={TrabajadorScreen} /> 
      <Stack.Screen name="Servicio" component={ServicioScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VincularMercadoPago" component={MercadoPagoScreen} />
      <Stack.Screen name="Horario" component={Horario} />
      <Stack.Screen name="EditarHorario" component={EditarHorarioScreen} /> 
    </Stack.Navigator>
  );
};

const ClienteStack = () => (
  <Stack.Navigator
    // Ocultamos el header en los stacks anidados para que se muestre el header global
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="HomeNavigator" component={HomeClienteNavigator} />
    <Stack.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />  
    <Stack.Screen name="MicroempresaCliente" component={MicroempresaClienteScreen} />
    <Stack.Screen name="SeleccionServicio" component={SeleccionServicioScreen} />
    <Stack.Screen name="Valoracion" component={ValoracionServicioScreen} />
    <Stack.Screen name="AceptarInvitacion" component={AceptarInvitacionScreen} />   
    <Stack.Screen name="Pago" component={PaymentScreen} /> 
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="ConfirmacionReservaSlotScreen" component={ConfirmacionReservaSlotScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { setIsAuthenticated, isAuthenticated, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

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
  
  return (
    <Stack.Navigator
      screenOptions={{
        // Definimos un header global con un fondo que contrasta ligeramente con el fondo principal
        headerShown: true,
        headerStyle: { backgroundColor: getContrastColor(theme.background) },
        headerTitleStyle: { color: theme.text },
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons
              name={theme.background === "#FFFFFF" ? "moon" : "sunny"}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        ),
      }}
    >
      {isAuthenticated ? (
        user?.kind === 'Cliente' ? (
          <Stack.Screen name="Main" component={ClienteStack} options={{ title: "Cliente" }} />
        ) : (
          <Stack.Screen name="Main" component={TrabajadorStack} options={{ title: "Trabajador" }} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegistroCliente" component={RegistroClienteScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Estilos Globales
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarStyle: {
    height: 60,
    borderTopWidth: 0,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tabBarItemStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
});

export default AppNavigator;