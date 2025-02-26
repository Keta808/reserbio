import React, { useState } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  StatusBar 
} from 'react-native';
import valoracionService from '../services/valoracion.service';
import servicioService from '../services/servicio.service';

const ValoracionServicioScreen = ({ route, navigation }) => {
  const { reserva, clienteId } = route.params;
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  let idMicroempresa = null;

  const handleSubmit = async () => {
    if (!puntuacion) {
      Alert.alert('Error', 'Por favor, selecciona una puntuación.');
      return;
    }
    
    // Obtenemos el id de la microempresa
    idMicroempresa = await servicioService.getMicroempresaIdByServicioId(reserva.servicio._id);
    
    const valoracionData = {
      microempresa: idMicroempresa,
      servicio: reserva.servicio._id,
      cliente: clienteId,
      trabajador: reserva.trabajador._id,
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

  // Formateo de la fecha: "nombre del día, dd de MMMM de YYYY"
  const formattedFecha = new Date(reserva.fecha).toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          {/* Encabezado: Título y detalles */}
          <Text style={styles.title}>Valorar Servicio</Text>
          <Text style={styles.detailText}>Servicio: {reserva.servicio.nombre}</Text>
          <Text style={styles.detailText}>
            Trabajador: {reserva.trabajador.nombre} {reserva.trabajador.apellido}
          </Text>
          <Text style={styles.detailText}>Fecha: {formattedFecha}</Text>

          <Text style={styles.label}>Puntuación:</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setPuntuacion(star)}>
                <Text style={[styles.star, puntuacion >= star && styles.starSelected]}>
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

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Enviar Valoración</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Volver en la esquina inferior izquierda */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.footerBackButton}>
          <Text style={styles.footerBackButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4A90E2',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 20,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  star: {
    fontSize: 40,
    color: '#ccc',
    marginHorizontal: 6,
  },
  starSelected: {
    color: '#FFD700',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    padding: 12,
    borderRadius: 10,
    height: 100,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerBackButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  footerBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ValoracionServicioScreen;
