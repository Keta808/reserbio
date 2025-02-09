import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  RefreshControl,
  // OJO: "Memo" no existe en 'react-native'. Si quieres usar React.memo, debes importarlo de 'react'.
} from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';

// Configurar idioma al español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

/**
 * Componente memoizado para mostrar cada reserva en la Agenda,
 * evitando re-renderizados innecesarios.
 */
const ReservationItem = React.memo(({ item, onSelect }) => {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemTime}>Hora: {item.time}</Text>
      <Text style={styles.itemClient}>Cliente: {item.client}</Text>
      <Text style={styles.itemStatus}>Estado: {item.status}</Text>
    </TouchableOpacity>
  );
});

const CalendarScreen = () => {
  const [items, setItems] = useState({});
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);




  // Función para formatear las horas en HH:MM
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  // Función para obtener el ID del usuario desde AsyncStorage
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id;
      } else {
        console.error('No se encontraron datos de usuario en AsyncStorage');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos de AsyncStorage:', error);
      return null;
    }
  };

  /**
   * Función que carga las reservas desde la API y actualiza el estado.
   * Se declara con useCallback para evitar volver a crearse en cada render.
   */
  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('No se pudo obtener el ID del usuario');
        setLoading(false);
        return;
      }

      const response = await reservaService.getReservasByTrabajadorId(userId);
      const reservations = response.data;
     
      const mappedItems = {};
      reservations.forEach((reserva) => {
        const date = reserva.fecha.split('T')[0];
        if (!mappedItems[date]) {
          mappedItems[date] = [];
        }
      
        // Convertir `hora_inicio` a un objeto Date
        const horaInicio = new Date(reserva.hora_inicio);
      
        // Obtener duración del servicio en minutos (si no existe, asumimos 0 minutos)
  
        const duracionMinutos = reserva.duracion || 0;
        

        // Calcular la hora de fin sumando la duración en minutos
        const horaFin = new Date(horaInicio.getTime() + duracionMinutos * 60000);
        
       
        mappedItems[date].push({
          id: reserva._id,
          name: reserva.servicio.nombre || 'Reserva sin nombre',
          time: `${formatTime(horaInicio)} - ${formatTime(horaFin)}`,
          client:
            reserva.cliente?.nombre || reserva.cliente?.email || 'Desconocido',
          status: reserva.estado || 'Sin estado',
        });
      });
      
      setItems(mappedItems);
      setFilteredItems(mappedItems[selectedDay] || []);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  // Cargar reservas cuando se monta el componente
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Actualizar la lista filtrada cuando cambie el día seleccionado o las reservas
  useEffect(() => {
    setFilteredItems(items[selectedDay] || []);
  }, [selectedDay, items]);

  // Función que maneja el "pull to refresh"
  const handleRefresh = async () => {
    await loadReservations();
  };

  // Función para abrir el modal de confirmación y cerrar el modal de detalles
  const openConfirmModal = () => {
    setModalVisible(false); // Cerrar modal de detalles
    // Abrir modal de confirmación con un pequeño delay
    setTimeout(() => setConfirmModalVisible(true), 300);
  };

  // Función para cancelar la reserva
  const handleCancelReservation = async () => {
    try {
      await reservaService.cancelReserva(selectedReservation.id);
      setConfirmModalVisible(false);

      // Actualizar las reservas localmente
      const updatedItems = { ...items };
      updatedItems[selectedDay] = updatedItems[selectedDay].filter(
        (item) => item.id !== selectedReservation.id
      );
      setItems(updatedItems);
      setFilteredItems(updatedItems[selectedDay] || []);
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
    }
  };

  // useCallback para la selección de una reserva (evita recrear la función cada vez)
  const handleSelectReservation = useCallback((item) => {
    setSelectedReservation(item);
    setModalVisible(true);
  }, []);

  // Renderizado de cada reserva en la Agenda
  const renderItem = useCallback(
    (reservation) => (
      <ReservationItem
        item={reservation}
        onSelect={handleSelectReservation}
      />
    ),
    [handleSelectReservation]
  );

  // Renderizado cuando no hay reservas en una fecha
  const renderEmptyDate = () => (
    <View style={styles.emptyDate}>
      <Text>No hay reservas para esta fecha.</Text>
    </View>
  );

  if (loading && Object.keys(items).length === 0) {
    // Muestra un indicador de carga si aún no hay datos
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Agenda
        items={{ [selectedDay]: filteredItems }}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        // Cambiamos la lógica para comparar IDs en lugar del nombre
        rowHasChanged={(r1, r2) => r1.id !== r2.id}
        firstDay={1}
        selected={selectedDay}
        onDayPress={(day) => setSelectedDay(day.dateString)}
        pastScrollRange={1}
        futureScrollRange={1}
        // "Pull to refresh"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        }
        markedDates={Object.keys(items).reduce((acc, date) => {
          const today = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
    
          // Solo marcamos fechas que sean hoy o en el futuro
          if (date >= today) {
            acc[date] = {
              customStyles: {
                container: {
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                },
                text: {
                  color: 'black',
                  fontWeight: 'bold',
                },
              },
              dots: [
                {
                  key: date,
                  color: '#007BFF',
                  selectedDotColor: '#007BFF',
                },
              ],
            };
          }
          return acc;
        }, {})}
        markingType="multi-dot" // Permite usar puntos redondos

      />

      {/* Modal de Detalles */}
      {selectedReservation && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalle de la Reserva</Text>
              <Text style={styles.modalText}>
                Servicio: {selectedReservation.name}
              </Text>
              <Text style={styles.modalText}>
                Hora: {selectedReservation.time}
              </Text>
              <Text style={styles.modalText}>
                Cliente: {selectedReservation.client}
              </Text>
              <Text style={styles.modalText}>
                Estado: {selectedReservation.status}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={openConfirmModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de Confirmación */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Cancelación</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas cancelar esta cita?
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleCancelReservation}
            >
              <Text style={styles.confirmButtonText}>Sí, Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTime: {
    fontSize: 14,
    color: '#555',
  },
  itemClient: {
    fontSize: 14,
    color: '#888',
  },
  itemStatus: {
    fontSize: 14,
    color: '#888',
  },
  emptyDate: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 17,
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CalendarScreen;
