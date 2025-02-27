import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/root.services.js';

// Importar pantallas
import MicroempresaInicioScreeen from '../screens/microempresa.screen.js';
// import FormularioMicroempresa from '../screens/formularioMicroempresa.screen.js';
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
import RegistroClienteScreen from '../screens/registroClientes.screen.js';
// import HomeScreen from '../screens/home.screen.js';
import CalendarScreen from '../screens/calendario.screen.js'; 
import HomeClienteScreen from '../screens/homeCliente.screen.js';
import MicroempresaClienteScreen from '../screens/microempresaCliente.screen.js';
import SeleccionServicioScreen from '../screens/seleccionServicio.screen.js';
import ConfirmacionReservaScreen from '../screens/confirmacionReserva.screen.js';
// import TestScreen from '../screens/testimagenes.screen.js';
import ReservaClienteScreen from '../screens/reservasCliente.screen.js';
import ValoracionServicioScreen from '../screens/valoracion.screen.js';
import AceptarInvitacionScreen from '../screens/aceptarInvitacionScreen.js';

// Pantallas para Trabajador
import gestorSuscripcionScreen from '../screens/gestorSuscripcion.screen.js'; 
import CardScreen from '../screens/cardForm.screen.js'; 
import TrabajadorScreen from '../screens/trabajador.screen.js';
import HomeTrabajadorScreen from '../screens/homeTrabajador.screen.js';
import ServicioScreen from '../screens/servicio.screen.js';
import MercadoPagoScreen from '../screens/mercadopago.screen.js';


// Pantalla test

import Horario from '../screens/horario.screen.js';
import EditarHorarioScreen from '../screens/editarHorarioScreen.js';
import ConfirmacionReservaSlotScreen from '../screens/confirmacionReservaSlot.screen.js';

import InvitarTrabajadorScreen from '../screens/invitarTrabajadores.screen.js';
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



const HomeClienteNavigator = () => (
 <Tab.Navigator lazy={true}> 
    <Tab.Screen name="ListaMicroempresas" component={ListaMicroempresasScreen} />
    <Tab.Screen name="HomeCliente" component={HomeClienteScreen} />
    <Tab.Screen name="Reservas" component={ReservaClienteScreen} /> 
    <Tab.Screen name="Suscripcion" component={SuscripcionScreen} />
  </Tab.Navigator>
);
const HomeTrabajadorNavigator = () => (
<Tab.Navigator lazy={true}>
    <Tab.Screen name="HomeTrabajador" component={HomeTrabajadorScreen} />  
    <Tab.Screen name="Calendario" component={CalendarScreen} />
    {/* <Tab.Screen name="Microempresa" component={MicroempresaInicioScreeen} /> */}
    <Tab.Screen name="SeleccionMicroempresa" component={SeleccionMicroempresaScreen} /> 
    <Tab.Screen name="Horario" component={DisponibilidadScreen} /> 
    <Tab.Screen name="Perfil" component={TrabajadorScreen} />
    <Tab.Screen name="HorarioTEST" component={Horario} /> 
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
      <Stack.Screen name="Valoracion" component={ValoracionServicioScreen} />
      <Stack.Screen name="AceptarInvitacion" component={AceptarInvitacionScreen} />   
      <Stack.Screen name="Pago" component={PaymentScreen} /> 
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name= "ConfirmacionReservaSlotScreen" component={ConfirmacionReservaSlotScreen} />
      
    </Stack.Navigator>
  );
  
  const TrabajadorStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeNavigator" component={HomeTrabajadorNavigator} />
      <Stack.Screen name="FormularioCreacionHoras" component={FormularioCreacionHorasScreen} />
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

      <Stack.Screen name="HorarioTEST" component={Horario} />
      <Stack.Screen name="EditarHorario" component={EditarHorarioScreen} /> 
     
    </Stack.Navigator>
  );
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        (() => {
          console.log('Valor de user:', user); 
          console.log('Valor de user.kind:', user?.kind);
          return user?.kind === 'Cliente' ? ( 
            <Stack.Screen name="Cliente" component={ClienteStack} />
          ) : (
            <Stack.Screen name="Worker" component={TrabajadorStack} />
          );
        })()
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegistroCliente" component={RegistroClienteScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
