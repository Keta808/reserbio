import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Button,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useNavigation, useRoute } from '@react-navigation/native';
import servicioService from '../services/servicio.service.js';

const SeleccionServicioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { microempresaId, trabajadores } = route.params;

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedServicio, setSelectedServicio] = useState(null);

  // Usamos undefined para indicar que el usuario no ha elegido nada aún
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState(undefined);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const data = await servicioService.getServiciosByMicroempresaId(microempresaId);
        const serviciosArray = data.data;
        setServicios([...serviciosArray]);
      } catch (err) {
        console.error('Error al obtener los servicios:', err);
        setError('No se pudo conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [microempresaId]);

  const handleTrabajadorSelect = (trabajadorId) => {
    // trabajadorId = null => sin preferencia, 
    // trabajadorId = 'abc123' => alguno en particular
    console.log('Trabajador seleccionado:', trabajadorId);
    setSelectedTrabajadorId(trabajadorId);
  };

  // const handleServicioSelect = (servicioId) => {
  //  setSelectedServicio(servicioId);
  // };

  const handleContinue = () => {
    navigation.navigate('ConfirmacionReserva', {
      microempresaId,
      servicioId: selectedServicio.id || selectedServicio._id,
      trabajadorId: selectedTrabajadorId, // Esto puede ser null o un string
      fecha: selectedDate.toISOString().split('T')[0],
    });
  };

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    console.log('Fecha seleccionada:', selected);
    if (selected) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const oneWeekLater = new Date();
      oneWeekLater.setDate(today.getDate() + 7);
      oneWeekLater.setHours(23, 59, 59, 999);
     // console.log('Hoy:', today);


      if (selected >= today && selected <= oneWeekLater) {
        
        setSelectedDate(selected);
      } else {
        alert('Por favor selecciona una fecha entre hoy y una semana en el futuro.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando servicios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un servicio</Text>
      <FlatList
        data={servicios}
        keyExtractor={(item, index) =>
          item.id?.toString() || item._id?.toString() || index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, selectedServicio?.id === item.id && styles.selectedCard]}
            onPress={() => setSelectedServicio(item)}
          >
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardSubtitle}>{item.duracion} min</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.subHeader}>Selecciona un trabajador</Text>
      <FlatList
        data={[
          ...trabajadores.map((item) => ({ id: item._id, nombre: item.nombre })),
          { id: null, nombre: 'No tengo preferencia' },
        ]}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, selectedTrabajadorId === item.id && styles.selectedCard]}
            onPress={() => handleTrabajadorSelect(item.id)}
          >
            <Text style={styles.cardTitle}>{item.nombre || 'Sin nombre definido'}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.subHeader}>Selecciona una fecha</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>
          {selectedDate.toISOString().split('T')[0]}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()} // Bloquea fechas pasadas
          maximumDate={(() => {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 7);
            return maxDate;
          })()} // Bloquea más de una semana en el futuro
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Continuar"
          onPress={handleContinue}
          // Habilita si hay servicio escogido y se eligió algún trabajador
          // (sea un ID real o null => 'No tengo preferencia')
          disabled={!selectedServicio || selectedTrabajadorId === undefined}
          color="#007bff"
        />
        <Button
          title="Atras"
          onPress={() => navigation.goBack()}
          color="#dc3545"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Asegura que los elementos empiecen desde arriba
    padding: 16,
    backgroundColor: '#f5f5f5', // Fondo más claro y moderno
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12, // Bordes más redondeados
    marginVertical: 10, // Mayor separación entre tarjetas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Sombra más destacada en Android
  },
  selectedCard: {
    backgroundColor: '#e0f7fa', // Color de selección más agradable
    borderColor: '#007bff',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18, // Títulos más grandes
    fontWeight: '600',
    textAlign: 'center',
    color: '#333', // Texto más oscuro
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666', // Texto más suave
    textAlign: 'center',
    marginTop: 4,
  },
  header: {
    fontSize: 26, // Cabecera principal más grande
    fontWeight: 'bold',
    marginTop: 40, // Espaciado ajustado
    marginBottom: 20, // Espaciado adicional debajo
    textAlign: 'center',
    color: '#007bff', // Azul para destacar
  },
  subHeader: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
    color: '#444', // Texto más definido
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#ccc', // Borde ligero para definir
    borderWidth: 1,
    marginVertical: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: '#007bff', // Azul para el texto
  },
  buttonContainer: {
    marginTop: 30, // Mayor separación con la parte superior
    alignSelf: 'center',
    width: '90%', // Botones más anchos
    flexDirection: 'row', // Coloca los botones en línea
    justifyContent: 'space-between', // Espaciado uniforme entre los botones
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});


export default SeleccionServicioScreen;
