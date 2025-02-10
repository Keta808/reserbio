import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Modal, RefreshControl } from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';

moment.locale('es');

const AgendaScreen = () => {
  const [items, setItems] = useState({}); // Objeto: { "YYYY-MM-DD": [eventos] }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Función para cargar (o refrescar) los datos desde el backend
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

  // Genera un array de 10 días (desde 2 días atrás hasta 7 días en adelante)
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

  // Ordena los eventos por la hora de inicio (de menor a mayor)
  const sortedEventsForSelectedDay = [...eventsForSelectedDay].sort((a, b) => a.start - b.start);

  // Modal de cancelación
  const openCancelModal = (event) => {
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Container para el Calendar Strip */}
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
                  {day.format('ddd')}
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

      {/* Container para la Agenda */}
      <View style={styles.agendaContainer}>
        <Text style={styles.agendaTitle}>
          Reservas para {moment(selectedDate).format('MMMM D dddd ')}
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
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.name}</Text>
                  <Text style={styles.eventTime}>
                    Inicio: {moment(item.start).format('LT')} - Fin: {moment(item.end).format('LT')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.cancelButton} onPress={() => openCancelModal(item)}>
                  <Text style={styles.cancelButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
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
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  // Container del strip con altura fija de 50 píxeles
  stripContainer: {
    height: 70,
    marginTop:20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stripContent: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  selectedDayContainer: {
    backgroundColor: '#4CAF50',
  },
  todayContainer: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  dayName: {
    fontSize: 20,
    color: '#333',
  },
  dayNumber: {
    fontSize: 20,
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
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5722',
    marginTop: 2,
  },
  // Container de la agenda
  agendaContainer: {
    flex: 1,
    padding: 10,
    marginTop: 20,
  },
  agendaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noEventsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  cancelButton: {
    marginLeft: 10,
    padding: 8,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
