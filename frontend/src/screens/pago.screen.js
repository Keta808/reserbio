import React, { useState } from 'react';
import { View, Alert, StyleSheet, ActivityIndicator, Modal, Text,  KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import PaymentForm from '../components/paymentform.component.js'; // Ruta del componente
// LLAMAR A FUNCION GENERAR TOKEN ID
import { obtenerSuscripcion, getIssuers, getIdentificationTypes, cardForm } from '../services/suscripcion.service.js'; 
import  { logout }  from '../services/auth.services';



const PaymentScreen = ({ route, navigation }) => {
  const { selectedPlan, user } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  console.log("Plan seleccionado:", selectedPlan);
  console.log("Usuario autenticado:", user);
  // Función para procesar el pago

  const handlePayment = async (paymentData) => { 
    console.log("HandlePayment PaymentData:", paymentData);
    setIsLoading(true); // Mostrar el indicador de carga
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
          
         
         
          Alert.alert(
            'Éxito', 
            'Suscripción realizada con éxito. Para usar la aplicacion como Microempresa necesitas volver a iniciar sesión como TRABAJADOR.',
            [
              {
                text: "OK",
                onPress: async () => {
                  await logout();
                  navigation.navigate("Login"); // Asegura que el usuario vuelva al login después del logout
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Hubo un problema al procesar la suscripción');
          navigation.navigate('HomeNavigator', { screen: 'Suscripciones' });
        }
      } else {
        Alert.alert('Error', 'No se pudo procesar la tarjeta');
      }
    } catch (error) { 
      console.error("Error processing payment:", error.message || error);
      Alert.alert('Ocurrió un error al procesar el pago', 'Datos de Tarjeta incorrectos' );
    } finally {
      setIsLoading(false); // Ocultar el indicador de carga
    }
  }; 

  const fetchDynamicData = async () => {
    try {
      const issuers = await getIssuers();
      const identificationTypes = await getIdentificationTypes();
      return { issuers, identificationTypes };
    } catch (error) {
      console.error("Error fetching dynamic data:", error.message || error);
      throw error;
    }
  }; 

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <PaymentForm onSubmit={handlePayment} fetchDynamicData={fetchDynamicData} selectedPlan={selectedPlan} />
      </ScrollView>

      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Procesando pago...</Text>
        </View>
      </Modal>
   </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
