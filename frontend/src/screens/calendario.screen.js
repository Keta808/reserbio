import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal, 
  RefreshControl,
  PanResponder
} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';

moment.locale('es');

const AgendaScreen = () => {
  const [items, setItems] = useState({}); // { "YYYY-MM-DD": [eventos] }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Ref para mantener la fecha seleccionada actualizada en el PanResponder
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Función para cargar datos desde el backend
  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.error('No se encontró el objeto user en AsyncStorage');
        return;
      }
      const user = JSON.parse(userData);
      const workerId = user.id;
      console.log("ID del trabajador:", workerId);
      const agendaData = await reservaService.getReservasByTrabajadorId(workerId);
      console.log("Data transformada para Agenda:", agendaData);
      setItems(agendaData);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Genera un array de 10 días (desde 2 días atrás hasta 7 días adelante)
  const generateDays = () => {
    const days = [];
    const startDay = moment().subtract(2, 'days');
    const numDays = 10;
    for (let i = 0; i < numDays; i++) {
      days.push(moment(startDay).add(i, 'days'));
    }
    return days;
  };

  const days = generateDays();

  const onDateSelected = (date) => {
    console.log("Fecha seleccionada:", moment(date).format("YYYY-MM-DD"));
    setSelectedDate(date);
  };

  const selectedKey = moment(selectedDate).format('YYYY-MM-DD');
  const eventsForSelectedDay = items[selectedKey] || [];
  // Ordenar los eventos por hora de inicio (de menor a mayor)
  const sortedEventsForSelectedDay = [...eventsForSelectedDay].sort((a, b) => a.start - b.start);

  // Modal de cancelación de reserva
  const openCancelModal = (event) => {
    console.log("Evento para modal:", event);
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const confirmCancel = async () => {
    if (selectedEvent) {
      try {
        const result = await reservaService.cancelReserva(selectedEvent.id);
        console.log("Reserva cancelada:", result);
        const updatedItems = { ...items };
        if (updatedItems[selectedKey]) {
          updatedItems[selectedKey] = updatedItems[selectedKey].filter(e => e.id !== selectedEvent.id);
          setItems(updatedItems);
        }
      } catch (error) {
        console.error("Error al cancelar reserva:", error);
      } finally {
        setModalVisible(false);
        setSelectedEvent(null);
      }
    }
  };

  const cancelModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // PanResponder para detectar swipe horizontal en la agenda y cambiar el día
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log("Gesture dx:", gestureState.dx);
        if (gestureState.dx < -30) {
          // Swipe a la izquierda: sumar un día basado en la fecha seleccionada actual
          const newDate = moment(selectedDateRef.current).add(1, 'days').toDate();
          console.log("Swipe izquierda, nuevo día:", moment(newDate).format("YYYY-MM-DD"));
          setSelectedDate(newDate);
        } else if (gestureState.dx > 30) {
          // Swipe a la derecha: restar un día basado en la fecha seleccionada actual
          const newDate = moment(selectedDateRef.current).subtract(1, 'days').toDate();
          console.log("Swipe derecha, nuevo día:", moment(newDate).format("YYYY-MM-DD"));
          setSelectedDate(newDate);
        }
      },
    })
  ).current;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Calendar Strip */}
        <View style={styles.stripContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripContent}>
            {days.map((day, index) => {
              const dateKey = day.format('YYYY-MM-DD');
              const isSelected = moment(selectedDate).isSame(day, 'day');
              const isToday = moment().isSame(day, 'day');
              const hasEvent = items && items[dateKey] && items[dateKey].length > 0;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => onDateSelected(day.toDate())}
                  style={[
                    styles.dayContainer,
                    isSelected && styles.selectedDayContainer,
                    !isSelected && isToday && styles.todayContainer,
                  ]}
                >
                  <Text style={[styles.dayName, isSelected && styles.selectedDayName]}>
                    {day.format('ddd').toUpperCase()}
                  </Text>
                  <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>
                    {day.format('D')}
                  </Text>
                  {hasEvent && <View style={styles.dot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Agenda de eventos con swipe */}
        <View style={styles.agendaContainer} {...panResponder.panHandlers}>
          <Text style={styles.agendaTitle}>
            Reservas para {moment(selectedDate).format('dddd, D [de] MMMM [de] YYYY')}
          </Text>
          {sortedEventsForSelectedDay.length === 0 ? (
            <Text style={styles.noEventsText}>No hay reservas para este día.</Text>
          ) : (
            <FlatList
              data={sortedEventsForSelectedDay}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
              }
              renderItem={({ item }) => {
                console.log("Evento recibido:", item);
                return (
                  <View style={styles.eventItem}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.serviceName}>
                        Servicio: {item.servicioNombre}
                      </Text>
                      <Text style={styles.clientName}>
                        Cliente: {item.clienteNombre}
                      </Text>
                      <Text style={styles.eventTime}>
                        Hora de servicio: {moment.parseZone(item.start).format('HH:mm')} - {moment.parseZone(item.end).format('HH:mm')}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => openCancelModal(item)}>
                      <Text style={styles.cancelButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* Modal de confirmación para cancelar reserva */}
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={cancelModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar cancelación</Text>
              <Text style={styles.modalMessage}>
                ¿Desea cancelar la reserva "{selectedEvent ? selectedEvent.name : ''}"?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={cancelModal}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={confirmCancel}>
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  stripContainer: {
    height: 80,
    marginTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
  },
  stripContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedDayContainer: {
    backgroundColor: '#4CAF50',
  },
  todayContainer: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  dayName: {
    fontSize: 16,
    color: '#333',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDayName: {
    color: '#fff',
  },
  selectedDayNumber: {
    color: '#fff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5722',
    marginTop: 4,
  },
  agendaContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
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
});

export default AgendaScreen;
