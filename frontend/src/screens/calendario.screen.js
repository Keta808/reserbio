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
import { useTheme } from '../context/theme.context';
import Ionicons from 'react-native-vector-icons/Ionicons';

moment.locale('es');

const AgendaScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const [items, setItems] = useState({}); // { "YYYY-MM-DD": [eventos] }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirming, setConfirming] = useState(false); // Para evitar pulsaciones múltiples

  // Ref para mantener la fecha seleccionada en el PanResponder
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
        setErrorMessage('No se encontró el objeto user en AsyncStorage');
        setErrorModal(true);
        setItems({});
        return;
      }
      const user = JSON.parse(userData);
      const workerId = user.id;
      const agendaData = await reservaService.getReservasByTrabajadorId(workerId);
      setItems(agendaData || {});
    } catch (error) {
      setErrorMessage("Actualmente no hay reservas asociadas a tu cuenta.");
      setErrorModal(true);
      setItems({});
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
    setSelectedDate(date);
  };

  const selectedKey = moment(selectedDate).format('YYYY-MM-DD');
  const eventsForSelectedDay = items[selectedKey] || [];
  // Ordenar eventos por hora de inicio
  const sortedEventsForSelectedDay = [...eventsForSelectedDay].sort((a, b) => a.start - b.start);

  // Modal de cancelación de reserva
  const openCancelModal = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const confirmCancel = async () => {
    if (selectedEvent && !confirming) {
      setConfirming(true);
      try {
        console.log("Cancelando reserva:", selectedEvent);
     
        await reservaService.cancelReserva(selectedEvent.id);
        const updatedItems = { ...items };
        if (updatedItems[selectedKey]) {
          updatedItems[selectedKey] = updatedItems[selectedKey].filter(e => e.id !== selectedEvent.id);
          setItems(updatedItems);
        }
      } catch (error) {
        setErrorMessage("Error al cancelar reserva: " + error.message);
        setErrorModal(true);
      } finally {
        setModalVisible(false);
        setSelectedEvent(null);
        setConfirming(false);
      }
    }
  };

  const cancelModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // PanResponder para detectar swipe horizontal y cambiar el día
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -30) {
          const newDate = moment(selectedDateRef.current).add(1, 'days').toDate();
          setSelectedDate(newDate);
        } else if (gestureState.dx > 30) {
          const newDate = moment(selectedDateRef.current).subtract(1, 'days').toDate();
          setSelectedDate(newDate);
        }
      },
    })
  ).current;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        

        {/* Calendar Strip */}
        <View style={[styles.stripContainer, { 
          backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#333",
          borderBottomColor: theme.background === "#FFFFFF" ? "#e0e0e0" : "#333" 
        }]}>
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
                  <Text style={[styles.dayName, { color: theme.text }, isSelected && styles.selectedDayName]}>
                    {day.format('ddd').toUpperCase()}
                  </Text>
                  <Text style={[styles.dayNumber, { color: theme.text }, isSelected && styles.selectedDayNumber]}>
                    {day.format('D')}
                  </Text>
                  {hasEvent && <View style={styles.dot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Agenda de eventos con swipe */}
        <View style={[styles.agendaContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]} {...panResponder.panHandlers}>
          <Text style={[styles.agendaTitle, { color: theme.text }]}>
            Reservas para {moment(selectedDate).format('dddd, D [de] MMMM [de] YYYY')}
          </Text>
          {sortedEventsForSelectedDay.length === 0 ? (
            <Text style={[styles.noEventsText, { color: theme.text }]}>No hay reservas para este día.</Text>
          ) : (
            <FlatList
              data={sortedEventsForSelectedDay}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
              }
              renderItem={({ item }) => {
                const isCancelable = moment(item.start).isSameOrAfter(moment(), 'day');
                return (
                  <View style={[styles.eventItem, { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#333" }]}>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.serviceName, { color: theme.text }]}>
                        Servicio: {item.servicioNombre}
                      </Text>
                      <Text style={[styles.clientName, { color: theme.text }]}>
                        Cliente: {item.clienteNombre}
                      </Text>
                      <Text style={[styles.eventTime, { color: theme.text }]}>
                        Hora de servicio: {moment.parseZone(item.start).format('HH:mm')} - {moment.parseZone(item.end).format('HH:mm')}
                      </Text>
                    </View>
                    {isCancelable && (
                      <TouchableOpacity style={styles.cancelButton} onPress={() => openCancelModal(item)}>
                        <Text style={styles.cancelButtonText}>X</Text>
                      </TouchableOpacity>
                    )}
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
            <View style={[styles.modalContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Confirmar cancelación</Text>
              <Text style={[styles.modalMessage, { color: theme.text }]}>
                ¿Desea cancelar la reserva "{selectedEvent ? selectedEvent.name : ''}"?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={cancelModal}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm, confirming && { opacity: 0.5 }]} 
                  onPress={confirmCancel}
                  disabled={confirming}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    {confirming ? 'Confirmando...' : 'Confirmar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de error */}
        <Modal
          transparent
          animationType="fade"
          visible={errorModal}
          onRequestClose={() => setErrorModal(false)}
        >
          <TouchableOpacity style={styles.errorModalOverlay} onPress={() => setErrorModal(false)}>
            <View style={[styles.errorModalContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
              <Text style={[styles.errorModalMessage, { color: theme.text }]}>{errorMessage}</Text>
              <TouchableOpacity style={styles.errorModalCloseButton} onPress={() => setErrorModal(false)}>
                <Text style={styles.errorModalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  toggleIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  stripContainer: {
    height: 80,
    marginTop: 20,
    borderBottomWidth: 1,
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
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
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
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  eventItem: {
    flexDirection: 'row',
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
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 18,
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
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContainer: {
    width: '80%',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  errorModalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
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

export default AgendaScreen;

