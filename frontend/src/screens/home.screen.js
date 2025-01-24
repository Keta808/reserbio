import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/auth.context'; 
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  }; 
  const handleGoToSuscripcion = () => {
    navigation.navigate('Suscripcion');
  };
  const handleGoToGestorSuscripcion = () => {
    navigation.navigate('GestorSuscripcion');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la App de Reservas</Text> 
      <Button title="Ir a Suscripciones" onPress={handleGoToSuscripcion} />
      <Button title="Cerrar Sesión" onPress={handleLogout} /> 
      <Button title="Gestionar Suscripción" onPress={handleGoToGestorSuscripcion} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});