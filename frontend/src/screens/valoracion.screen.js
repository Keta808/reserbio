import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity,Platform } from 'react-native';

import valoracionService from '../services/valoracion.service';
import microempresaService from '../services/microempresa.service';

const ValoracionServicioScreen = ({ route, navigation }) => {
  const { reserva, clienteId } = route.params;
  //console.log("cliente id", clienteId);
  //console.log("reserva",reserva);

  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  //console.log("id reserva", reserva._id);
  //id de trabajador de microempresa por servicio
  let idMicroempresa = null;

  const handleSubmit = async () => {
    if (!puntuacion) {
      Alert.alert('Error', 'Por favor, selecciona una puntuación.');
      return;
    }
   
    idMicroempresa = await microempresaService.getMicroempresaIdByTrabajadorId(reserva.trabajador._id);
  
    
    const valoracionData = {
      microempresa: idMicroempresa,
      servicio: reserva.servicio._id,
      cliente: clienteId,
      trabajador: reserva.trabajador._id,
      reserva: reserva._id,
      puntuacion,
      comentario,
    };

     console.log(valoracionData);
    try {
      await valoracionService.crearValoracion(valoracionData);
      console.log(valoracionData);
      Alert.alert('Éxito', 'Tu valoración ha sido enviada.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la valoración.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valorar Servicio</Text>

      <Text style={styles.label}>Puntuación:</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setPuntuacion(star)}>
            <Text style={[styles.star, puntuacion >= star ? styles.starSelected : null]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Comentario:</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Escribe tu comentario..."
        multiline
        maxLength={500}
        value={comentario}
        onChangeText={setComentario}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enviar Valoración</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f5', // Fondo más suave
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '15%',
    color: '#4A90E2 ',
    fontFamily: 'Arial',
  },
  label: {
    marginTop: 35,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
     
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-arround',
    marginVertical: 15, 
  },

  star: {
    fontSize: 40, // Tamaño ajustado para destacar mejor
    color: '#ccc', // Color gris claro para las no seleccionadas
    marginHorizontal: 10, // Espacio uniforme entre las estrellas
  },
  starSelected: {
    color: '#FFD700', // Amarillo brillante para las estrellas seleccionadas
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#4A90E2', // Bordes más vibrantes
    padding: 12,
    borderRadius: 10, // Bordes más redondeados
    height: 100,
    marginTop: 10,
    backgroundColor: '#f9f9f9', // Fondo suave
    fontSize: 16, // Texto más legible
    textAlignVertical: 'top', // Asegura que el texto comience desde arriba
  },
  button: {
    backgroundColor: '#4A90E2', // Fondo azul vibrante
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%', // Botón más grande
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ValoracionServicioScreen;
