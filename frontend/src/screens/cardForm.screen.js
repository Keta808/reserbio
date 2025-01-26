import React from 'react'; 

import { View, StyleSheet, Button, Alert } from 'react-native'; 

import CardForm from '../components/card.component'; // Ruta del formulario
import { cardForm, getIdentificationTypes,getIssuers, updateSuscripcionCard } from '../services/suscripcion.service';
import { useNavigation } from '@react-navigation/native'; 

const CardScreen = ({ route }) => {
    const { suscripcion, user } = route.params; // Recibimos estos datos desde la screen anterior
    const navigation = useNavigation();
  
    const handleCardUpdate = async (paymentData) => {
      try {
        console.log("Datos enviados al backend para generar cardTokenId:", paymentData);
  
        // Generar el `cardTokenId`
        const newCardTokenId = await cardForm(paymentData); 
        const preapprovalId = suscripcion.id;  
        const idUser = user.id; 
        const updatedCard = await updateSuscripcionCard(preapprovalId, newCardTokenId, idUser); 
        console.log("Tarjeta actualizada:", updatedCard); 
        console.log("Nuevo Card Token ID generado:", newCardTokenId);
  
        if (newCardTokenId && updatedCard.state === 'Success') {
          Alert.alert("Éxito", "Los datos de la tarjeta han sido actualizados.");
          // Puedes realizar actualizaciones en el backend o en la UI aquí si es necesario
          navigation.goBack(); // Volver a la pantalla de gestión de suscripciones
        } else {
          Alert.alert("Error", "No se pudo generar el token de la tarjeta.");
        }
      } catch (error) {
        console.error("Error updating card:", error.message || error);
        Alert.alert("Error", "Ocurrió un error al actualizar la tarjeta.");
      }
    };
  
    // Función para cargar los bancos y tipos de identificación
    const fetchDynamicData = async () => {
      try {
        const issuers = await getIssuers();
        const identificationTypes = await getIdentificationTypes();
        console.log("Bancos disponibles:", issuers);
        console.log("Tipos de identificación disponibles:", identificationTypes);
  
        return { issuers, identificationTypes };
      } catch (error) {
        console.error("Error al obtener datos dinámicos:", error.message || error);
        throw error;
      }
    };
  
    return (
      <View style={styles.container}>
        <CardForm onSubmit={handleCardUpdate} fetchDynamicData={fetchDynamicData} />
        <Button title="Volver" onPress={() => navigation.goBack()} /> {/* Botón para volver */}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f4f4f8',
    },
  });
  
  export default CardScreen;