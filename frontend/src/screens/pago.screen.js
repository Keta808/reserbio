import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { MercadoPagoCheckout } from 'react-native-mercadopago-px';
import { useRoute, useNavigation } from '@react-navigation/native';
import { crearSuscripcion } from '../services/suscripcion.service.js';

const PaymentScreen = () => {
  const { params } = useRoute(); // Para acceder a los parámetros enviados desde la pantalla de suscripción
  const { selectedPlan, user } = params; // Información del plan y el usuario
  const navigation = useNavigation();
  const [cardTokenId, setCardTokenId] = useState(null); // Estado para el cardTokenId
  const [loading, setLoading] = useState(false); // Estado de carga

  useEffect(() => {
    // Configuración inicial de Mercado Pago (puedes obtener tu publicKey desde Mercado Pago)
    MercadoPagoCheckout.setPublicKey('TEST-e049e8d4-7a1d-4a6e-933e-52ff9ece02e3'); // Cambia esto por tu clave pública
  }, []);

  const handlePayment = async () => {
    if (!cardTokenId) {
      Alert.alert('Error', 'Por favor, ingrese los datos de la tarjeta correctamente');
      return;
    }
    setLoading(true);
    try {
      // Crear la suscripción enviando el cardTokenId, la información del usuario y el plan seleccionado
      const response = await crearSuscripcion(selectedPlan.tipo_plan, user, cardTokenId);
      if (response.state === 'Success') {
        console.log('Suscripción realizada con éxito');
        console.log(response.data);
        Alert.alert('Exito', 'Suscripción realizada con éxito');
        navigation.navigate('Home'); // Redirigir a la pantalla de inicio
      } else {
        Alert.alert('Error', 'Hubo un problema al procesar el pago');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulario de Pago</Text>
      <MercadoPagoCheckout
        onCardTokenReceived={(token) => {
          setCardTokenId(token.id); // Obtener el cardTokenId
        }}
        onError={(error) => {
          console.error(error);
          Alert.alert('Error', 'Hubo un problema con los datos de la tarjeta');
        }}
      />
      <Button
        title={loading ? 'Procesando pago...' : 'Confirmar pago'}
        onPress={handlePayment}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default PaymentScreen;
