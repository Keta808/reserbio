import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
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
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState(undefined);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedTrabajadorNombre, setSelectedTrabajadorNombre] = useState(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const data = await servicioService.getServiciosByMicroempresaId(microempresaId);
        setServicios(data.data);
        
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
    console.log('Trabajador seleccionado:', trabajadorId);
    setSelectedTrabajadorId(trabajadorId);
    setSelectedTrabajadorNombre(trabajadores.find((t) => t._id === trabajadorId)?.nombre);
  };

  const handleContinue = () => {
    console.log('Enviando params:', {
      microempresaId,
      servicioId: selectedServicio.id || selectedServicio._id,
      trabajadorId: selectedTrabajadorId,
      fecha: selectedDate.toISOString().split('T')[0],
      trabajadorNombre: selectedTrabajadorNombre,
    });
  
    navigation.navigate('ConfirmacionReservaSlotScreen', {
      microempresaId,
      servicioId: selectedServicio.id || selectedServicio._id,
      trabajadorId: selectedTrabajadorId,
      fecha: selectedDate.toISOString().split('T')[0],
      trabajadorNombre: selectedTrabajadorNombre,
    });
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
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

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const ErrorMessage = ({ message, onClose }) => (
    <View style={styles.errorMessageContainer}>
      <Text style={styles.errorMessageText}>{message}</Text>
      <TouchableOpacity style={styles.errorMessageButton} onPress={onClose}>
        <Text style={styles.errorMessageButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message={error}
          onClose={() => setError(null)} // Limpia el error al cerrar el mensaje
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un servicio</Text>
      <FlatList
        data={servicios}
        keyExtractor={(item, index) =>
          item.id?.toString() || item._id?.toString() || `servicio-${index}`
        }
        renderItem={({ item }) => (
          <TouchableOpacity
          
            style={[
              styles.card,
              selectedServicio?._id === item._id && styles.selectedCard,
            ]}
            onPress={() => {
              console.log('Servicio seleccionado:', item);
              setSelectedServicio(item);
            }}
          >
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardSubtitle}>{item.duracion} min</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.cardContainer}
        numColumns={2}
      />

      <Text style={styles.subHeader}>Selecciona un trabajador</Text>
      <FlatList
          data={[
            ...trabajadores.map((item) => ({ id: item._id, nombre: item.nombre })),
            { id: null, nombre: 'No tengo preferencia' },
          ]}
          keyExtractor={(item, index) =>
            item.id?.toString() || `trabajador-${index}`
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.workerCard,
                selectedTrabajadorId === item.id && styles.selectedWorkerCard,
              ]}
              onPress={() => handleTrabajadorSelect(item.id)}
            >
              <Text style={styles.workerName}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.workerContainer}
          numColumns={2} // Define que haya 2 columnas
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }} // Ajusta espaciado entre columnas
          showsVerticalScrollIndicator={false}
        />


      <Text style={styles.subHeader}>Selecciona una fecha</Text>
              <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setDatePickerVisibility(true)}
        >
          <Text style={styles.datePickerText}>
         
            {selectedDate ? formatDate(selectedDate) : 'Selecciona una fecha'}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        minimumDate={new Date()}
        maximumDate={(() => {
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + 7);
          return maxDate;
        })()}
        themeVariant="light" // Fuerza el tema claro
        locale="es-ES" // Esto asegura que el modal use el idioma español
      />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Atrás</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedServicio || selectedTrabajadorId === undefined  || !selectedDate) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedServicio || selectedTrabajadorId === undefined  || !selectedDate}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
    marginTop:'20%',
  },
  cardContainer: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    margin: 10,
    flex: 1,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#e0f7fa',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  subHeader: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
    color: '#444',
  },

  workerContainer: {
    justifyContent: 'space-between', // Asegura espacio entre las columnas
    paddingHorizontal: 10, // Margen lateral
  },
  workerCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: '45%', // Ajusta el ancho para que quepan dos por fila con margen
    marginBottom: 10, // Espaciado entre filas
  },
  selectedWorkerCard: {
    backgroundColor: '#e0f7fa',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',

  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: '#007bff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 10,
    marginBottom: '10%',
  },
  backButton: {
    backgroundColor: '#dc3545', // Color rojo para el botón "Atrás"
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  continueButton: {
    backgroundColor: '#007bff', // Color azul para el botón "Continuar"
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#b0c4de', // Color gris para el estado deshabilitado
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  //error
  errorMessageContainer: {
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorMessageText: {
    color: '#721c24',
    fontSize: 16,
    marginBottom: 10,
  },
  errorMessageButton: {
    backgroundColor: '#f5c6cb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorMessageButtonText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SeleccionServicioScreen;
