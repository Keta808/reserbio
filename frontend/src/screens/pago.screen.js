import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import PaymentForm from '../components/paymentform.component'; // Ruta del componente
// LLAMAR A FUNCION GENERAR TOKEN ID
import { obtenerSuscripcion, getIssuers, getIdentificationTypes, cardForm } from '../services/suscripcion.service';



const PaymentScreen = ({ route, navigation }) => {
  const { selectedPlan, user } = route.params;

  const handlePayment = async (paymentData) => {
    try { 
      console.log("Datos enviados al backend para generar cardTokenId:", paymentData);
      // correo de comprador
      const payer_email = paymentData.cardholderEmail; 
      console.log("Correo de comprador:", payer_email );


      // Llama al servicio de backend para generar el `cardTokenId`
      const cardTokenId = await cardForm(paymentData); 
      
      
      console.log("Card Token ID:", cardTokenId);
      console.log("Plan seleccionado:", selectedPlan);
      console.log("Usuario autenticado:", user);
     
      if (cardTokenId) {
        const suscripcionResponse = await obtenerSuscripcion(
          selectedPlan,
          user,
          cardTokenId,
          payer_email,
        );

        if (suscripcionResponse.state === 'Success') {
           
          console.log("Suscripción realizada con éxito:", suscripcionResponse);
          
         
         
          // Redirigir a la pantalla de login 
          Alert.alert('Éxito', 'Suscripción realizada con éxito');
          navigation.navigate('HomeNavigator', { screen: 'Home' });
        } else {
          Alert.alert('Error', 'Hubo un problema al procesar la suscripción');
          navigation.navigate('HomeNavigator', { screen: 'Suscripciones' });
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
      console.log("Tipos de identificación:", identificationTypes); 
      
      console.log("Issuers fetched:", issuers);
    
      return { issuers, identificationTypes };
    } catch (error) {
      console.error("Error fetching dynamic data:", error.message || error);
      throw error;
    }
  }; 

  return (
    <View style={styles.container}> 
      <PaymentForm onSubmit={handlePayment} fetchDynamicData={fetchDynamicData} selectedPlan={selectedPlan} />
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
