import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';

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

      <Button title="Enviar Valoración" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  star: {
    fontSize: 30,
    color: '#ccc',
    marginHorizontal: 5,
  },
  starSelected: {
    color: '#FFD700', // Amarillo para las estrellas seleccionadas
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    height: 100,
    marginTop: 10,
  },
});

export default ValoracionServicioScreen;
