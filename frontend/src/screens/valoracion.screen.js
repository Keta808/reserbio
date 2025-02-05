import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
//import { AirbnbRating } from 'react-native-ratings';
//import { Rating } from 'react-native-ratings';

//import StarRating from 'react-native-star-rating';





import valoracionService from '../services/valoracion.service';

const ValoracionServicioScreen = ({ route, navigation }) => {
  const { reserva } = route.params;

  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');

  const handleSubmit = async () => {
    if (!puntuacion) {
      Alert.alert('Error', 'Por favor, selecciona una puntuación.');
      return;
    }

    const valoracionData = {
      microempresa: reserva.microempresa,
      servicio: reserva.servicio,
      cliente: reserva.cliente,
      reserva: reserva._id,
      puntuacion,
      comentario,
    };

    try {
      await valoracionService.crearValoracion(valoracionData);
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
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    fontSize: 16,
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
