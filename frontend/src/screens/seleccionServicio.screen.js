import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import servicioService from '../services/servicio.service.js';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const [descModalVisible, setDescModalVisible] = useState(false);
  const [serviceDescription, setServiceDescription] = useState('');

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

  const handleShowDescription = (servicio) => {
    setServiceDescription(servicio.descripcion);
    setDescModalVisible(true);
  };

  const handleTrabajadorSelect = (trabajadorId) => {
    setSelectedTrabajadorId(trabajadorId);
    setSelectedTrabajadorNombre(trabajadores.find((t) => t._id === trabajadorId)?.nombre);
  };

  const handleContinue = () => {
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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Para centrar el último elemento en caso de cantidad impar,
  // usamos ListFooterComponent para agregar un View vacío cuando es necesario.
  const serviciosFooter = () => {
    return servicios.length % 2 !== 0 ? <View style={{ width: '48%' }} /> : null;
  };

  // Similar para los trabajadores:
  const trabajadoresFooter = () => {
    return (trabajadores.length + 1) % 2 !== 0 ? <View style={{ width: '48%' }} /> : null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
       
      <Text style={styles.header}>Selecciona una fecha</Text>
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
            const max = new Date();
            max.setDate(max.getDate() + 7);
            return max;
          })()}
          themeVariant="light"
          locale="es-ES"
        />
       

        <Text style={styles.subHeader}>Selecciona un servicio</Text> 
        {/* Lista de Servicios */}
        <FlatList
          data={servicios}
          keyExtractor={(item, index) =>
            item.id?.toString() || item._id?.toString() || `servicio-${index}`
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                selectedServicio?._id === item._id && styles.selectedCard,
              ]}
              onPress={() => setSelectedServicio(item)}
            >
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubtitle}>{item.duracion} min</Text>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleShowDescription(item)}
              >
                <Icon name="information-circle-outline" size={20} color="#007bff" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          numColumns={2}
          ListFooterComponent={serviciosFooter}
          columnWrapperStyle={styles.cardRow}
        />
  
        <Text style={styles.subHeader}>Selecciona un trabajador</Text>
        <FlatList
          data={[
            ...trabajadores.map((t) => ({ id: t._id, nombre: t.nombre })),
            { id: null, nombre: 'No tengo preferencia' },
          ]}
          keyExtractor={(item, index) =>
            item.id?.toString() || `trabajador-${index}`
          }
          contentContainerStyle={styles.workerContainer}
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
          numColumns={2}
          ListFooterComponent={trabajadoresFooter}
          columnWrapperStyle={styles.workerRow}
        />
  
  
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedServicio || selectedTrabajadorId === undefined || !selectedDate) &&
                styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedServicio || selectedTrabajadorId === undefined || !selectedDate}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {/* Modal para mostrar la descripción del servicio */}
      <Modal
        visible={descModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDescModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Descripción del Servicio</Text>
            <Text style={styles.modalMessage}>{serviceDescription}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setDescModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#007bff',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  cardRow: {
    marginTop: 20,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 10,
    minHeight: 95,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#e0f7fa',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  infoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 0,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
    color: '#444',
  },
  workerContainer: {
    paddingHorizontal: 8,
  },
  workerRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  workerCard: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedWorkerCard: {
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  workerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginVertical: 16,
    marginBottom: 40,
  },
  datePickerText: {
    fontSize: 16,
    color: '#007bff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#dc3545',
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#007bff',
    flex: 1,
    marginLeft: 8,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b0c4de',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  agendaContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    // Sombra para el contenedor
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  agendaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  cancelButton: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FF5722',
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonTextConfirm: {
    color: '#fff',
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  errorModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#D32F2F',
  },
  errorModalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  errorModalCloseButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  errorModalCloseButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SeleccionServicioScreen;
