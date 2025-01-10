import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import PaymentForm from '../components/paymentform.component'; // Ruta del componente
// LLAMAR A FUNCION GENERAR TOKEN ID
import { crearSuscripcion,getIssuers,getIdentificationTypes,cardForm } from '../services/suscripcion.service';

const PaymentScreen = ({ route, navigation }) => {
  const { selectedPlan, user } = route.params;

  const handlePayment = async (paymentData) => {
    try { 
      console.log("Datos enviados al backend para generar cardTokenId:", paymentData);
      // Llama al servicio de backend para generar el `cardTokenId`
      const cardTokenId = await cardForm(paymentData);
      console.log("Card Token ID:", cardTokenId);

      if (cardTokenId) {
        const suscripcionResponse = await crearSuscripcion(
          selectedPlan,
          user,
          cardTokenId
        );

        if (suscripcionResponse.state === 'Success') {
          Alert.alert('Éxito', 'Suscripción realizada con éxito');
          navigation.navigate('Home');
        } else {
          Alert.alert('Error', 'Hubo un problema al procesar la suscripción');
        }
      } else {
        Alert.alert('Error', 'No se pudo generar el token de la tarjeta');
      }
    } catch (error) { 
      console.error("Error processing payment:", error.message || error);
      Alert.alert('Error', 'Ocurrió un error al procesar el pago');
    }
  }; 

  const fetchDynamicData = async () => {
    try {
      const issuers = await getIssuers();
      const identificationTypes = await getIdentificationTypes();
      console.log("Issuers fetched:", issuers);
    console.log("Identification Types fetched:", identificationTypes);
      return { issuers, identificationTypes };
    } catch (error) {
      console.error("Error fetching dynamic data:", error.message || error);
      throw error;
    }
  }; 

  return (
    <View style={styles.container}>
      <PaymentForm onSubmit={handlePayment} fetchDynamicData={fetchDynamicData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default PaymentScreen;
