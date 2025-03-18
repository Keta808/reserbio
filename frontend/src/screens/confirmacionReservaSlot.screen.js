import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import horarioService from '../services/horario.service';
import reservaService from '../services/reserva.service';
import servicioService from '../services/servicio.service';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../context/theme.context';

const ConfirmacionReservaSlotScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { microempresaId, trabajadorId, servicioId, fecha, trabajadorNombre } = route.params;

  const { theme } = useTheme();
  // Suponemos que en modo claro el background es "#f0f4f7" (o "#FFFFFF") y en modo oscuro es distinto
  const isDarkMode = theme.background !== "#f0f4f7" && theme.background !== "#FFFFFF";

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duracionServicio, setDuracionServicio] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [clienteId, setClienteId] = useState(null); 
  const [urlPago, setUrlPago] = useState(null);

  useEffect(() => {
    const fetchClienteId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setClienteId(parsedData.id);
        }
      } catch (error) {
        console.error('Error al obtener el ID del cliente:', error);
      }
    };

    fetchClienteId();
  }, []);

  useEffect(() => {
    const fetchDuracionServicio = async () => {
      try {
        const response = await servicioService.getServicioById(servicioId);
        if (response.urlPago && response.urlPago !== null && response.urlPago !== "undefined") {
          setUrlPago(response.urlPago);
          console.log("URL PAGO", response.urlPago);
        }
        setDuracionServicio(response.duracion);
      } catch (error) {
        console.error('Error al obtener la duración del servicio:', error);
      }
    };
    fetchDuracionServicio();
  }, [servicioId]);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!fecha || !duracionServicio) return;
  
      try {
        setLoading(true);
        let response;
  
        if (trabajadorId) {
          response = await horarioService.getHorasDisponibles({
            trabajadorId,
            fecha,
            duracion: duracionServicio,
          });
        } else {
          response = await horarioService.getHorariosMicroEmpresa({
            serviceId: servicioId,
            date: fecha,
          });
        }
  
        if (response.state === 'Success') {
          let slots = response.data;
          // Si no se seleccionó trabajador, unificar y asignar uno aleatorio
          if (!trabajadorId) {
            const uniqueSlots = {};
            slots.forEach((slotEntry) => {
              const inicio = slotEntry.slot ? slotEntry.slot.inicio : slotEntry.inicio;
              const fin = slotEntry.slot ? slotEntry.slot.fin : slotEntry.fin;
              const trabajador = slotEntry.trabajador || null;
          
              const key = `${inicio}-${fin}`;
              if (!uniqueSlots[key]) {
                uniqueSlots[key] = { inicio, fin, trabajadores: trabajador ? [trabajador] : [] };
              } else if (trabajador) {
                if (!uniqueSlots[key].trabajadores.includes(trabajador)) {
                  uniqueSlots[key].trabajadores.push(trabajador);
                }
              }
            });
          
            slots = Object.values(uniqueSlots).map((slot) => {
              if (slot.trabajadores.length > 0) {
                const randomIndex = Math.floor(Math.random() * slot.trabajadores.length);
                slot.trabajadorAsignado = slot.trabajadores[randomIndex];
              }
              return slot;
            });
          }
  
          // Filtrar slots si la fecha es hoy (solo horarios futuros)
          const fechaSeleccionada = new Date(fecha);
          const hoy = new Date();
          if (fechaSeleccionada.toISOString().split('T')[0] === hoy.toISOString().split('T')[0]) {
            const horaActual = hoy.getUTCHours() + hoy.getUTCMinutes() / 60;
            slots = slots.filter((slot) => {
              const [horaInicio, minutoInicio] = slot.inicio.split(':').map(Number);
              const horaSlot = horaInicio + minutoInicio / 60;
              return horaSlot > horaActual;
            });
          }
  
          slots.sort((a, b) => a.inicio.localeCompare(b.inicio));
          setHorarios(slots);
        } else {
          setError(response.message || response.error || 'No hay horarios disponibles.');
        }
      } catch (err) {
        console.error('Error al obtener disponibilidad:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || 'Ocurrió un error al obtener los horarios.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchDisponibilidad();
  }, [trabajadorId, servicioId, fecha, duracionServicio]);

  const handleSlotPress = (slot) => {
    let assignedTrabajador = trabajadorId;
    let assignedTrabajadorNombre = trabajadorNombre;
  
    if (!trabajadorId && slot.trabajadores && slot.trabajadores.length > 0) {
      const randomIndex = Math.floor(Math.random() * slot.trabajadores.length);
      const trabajadorSeleccionado = slot.trabajadores[randomIndex];
      assignedTrabajador = trabajadorSeleccionado._id || trabajadorSeleccionado.id;
      assignedTrabajadorNombre = trabajadorSeleccionado.nombre || 'Trabajador desconocido';
    }
  
    setSelectedSlot({ ...slot, trabajadorAsignado: assignedTrabajador, trabajadorNombre: assignedTrabajadorNombre });
    setModalVisible(true);
  };

  const confirmarReserva = async () => {
    try {
      const reservaData = {
        trabajador: trabajadorId || selectedSlot.trabajadorAsignado,
        servicio: servicioId,
        fecha,
        hora_inicio: selectedSlot.inicio,
        cliente: clienteId,
        estado: 'Activa',
      };
      if (urlPago && urlPago !== null) { 
        setModalVisible(false);
        navigation.navigate("ServicioPaymentScreen", { urlPago, idServicio: servicioId, reservaData });
      } else { 
        const response = await reservaService.createReservaHorario(reservaData);
        console.log('Reserva creada:', response);

        if (error) {
          console.error('Error al confirmar reserva:', error);
          return;
       }
  
        setModalVisible(false);
        navigation.navigate('HomeNavigator', { screen: 'Reservas' });
      }
      
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && { backgroundColor: theme.background }]}>
        <View style={styles.containerError}>
          <Text style={[styles.errorHeader, isDarkMode && { color: theme.text }]}>Error</Text>
          <Text style={[styles.errorText, isDarkMode && { color: theme.text }]}>{error}</Text>
          <View style={styles.errorButtonsContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backNavButton}>
              <Text style={[styles.buttonText, isDarkMode && { color: theme.text }]}>Volver atrás</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && { backgroundColor: theme.background }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? theme.text : "#000"} />
          <Text style={isDarkMode && { color: theme.text }}>Cargando disponibilidad...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && { backgroundColor: theme.background }]}>
      <View style={[styles.container, isDarkMode && { backgroundColor: theme.background }]}>
        <Text style={[styles.header, isDarkMode && { color: theme.text }]}>Selecciona un horario</Text>
        <FlatList
          data={horarios}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode && { color: theme.text }]}>No hay horarios disponibles</Text>}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.slotButton,
                isDarkMode 
                  ? { backgroundColor: "#333" } 
                  : null,
              ]}
              onPress={() => handleSlotPress(item)}
            >
              <Text style={[styles.slotText, isDarkMode && { color: theme.text }]}>{`${item.inicio} - ${item.fin}`}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Botón de volver atrás posicionado en la parte inferior izquierda */}
        <TouchableOpacity
          style={[
            styles.backNavigationButton,
            isDarkMode && { backgroundColor: "#444" } // Aseguramos que tenga un fondo visible en modo oscuro
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, isDarkMode && { color: theme.text }]} >Volver atrás</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isDarkMode && { backgroundColor: "#444" }]}>
              <Text style={[styles.modalTitle, isDarkMode && { color: theme.text }]}>Confirmar Reserva</Text>
              {selectedSlot && (
                <>
                  <Text style={[styles.modalInfo, isDarkMode && { color: theme.text }]}>
                    Horario: {selectedSlot.inicio} - {selectedSlot.fin}
                  </Text>
                  <Text style={[styles.modalInfo, isDarkMode && { color: theme.text }]}>
                    Trabajador asignado: {trabajadorId ? trabajadorNombre : selectedSlot.trabajadorNombre}
                  </Text>
                  {urlPago && (
                    <Text style={[styles.modalWarning, isDarkMode && { color: theme.text }]}>
                      Seleccionaste un servicio con abono. Debes abonar para que se confirme la reserva.
                      Una vez pagado, deberás volver a la aplicacion y verificar el pago para reservar en la pantalla de verificacion. 
                    </Text>
                  )}
                </>
              )}
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, styles.modalButtonCancel]}>
                  <Text style={[styles.buttonText, isDarkMode && { color: theme.text }]}>Volver</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmarReserva} style={[styles.modalButton, styles.modalButtonConfirm]}>
                  <Text style={[styles.buttonText, isDarkMode && { color: theme.text }]}>Confirmar</Text>
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
    backgroundColor: '#f0f4f7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  slotButton: {
    width: '48%',
    height: 70,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  slotText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    elevation: 15,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333' 
  },
  modalInfo: {
    fontSize: 18,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonConfirm: {
    backgroundColor: '#28a745',
  },
  modalButtonCancel: {
    backgroundColor: '#dc3545',
  },
  modalWarning: {
    fontSize: 16,
    color: '#d9534f',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  containerError: {
    flex: 1,
    backgroundColor: '#f8d7da',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  backNavButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  backNavigationButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default ConfirmacionReservaSlotScreen;
