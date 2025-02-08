import React from 'react'; 

import { View, StyleSheet, Button, Alert } from 'react-native'; 

import CardForm from '../components/card.component'; // Ruta del formulario
import { cardForm, getIdentificationTypes, getIssuers, updateSuscripcionCard } from '../services/suscripcion.service';
import { useNavigation } from '@react-navigation/native'; 

const CardScreen = ({ route }) => {
    const { suscripcion, user } = route.params; // Recibimos estos datos desde la screen anterior
    const navigation = useNavigation();
    console.log("Datos de suscripción:", suscripcion);
    console.log("USER:", user);
    const handleCardUpdate = async (paymentData) => {
      try {
        console.log("Datos enviados al backend para generar cardTokenId:", paymentData);
  
        // Generar el `cardTokenId`
        const newCardTokenId = await cardForm(paymentData); 
        const preapprovalId = suscripcion.id;  
        const idUser = user.id; 
        
        console.log("Nuevo Card Token ID generado:", newCardTokenId);
        if (newCardTokenId) {
          const updatedCard = await updateSuscripcionCard(preapprovalId, idUser, newCardTokenId); 
          if (updatedCard.state === 'Success') { 
            console.log("Tarjeta actualizada con éxito:", updatedCard);
            Alert.alert("Tarjeta actualizada", "La tarjeta fue actualizada con éxito.");
            navigation.goBack();
          }else{
            Alert.alert("Error", "Ocurrió un error al actualizar la tarjeta."); 
            navigation.goBack();
          }
        }else{
          console.error("Error updating card:", error.message || error);
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
        <Button title="Volver" onPress={() => navigation.goBack()} /> 
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