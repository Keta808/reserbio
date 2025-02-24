import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import horarioService from '../services/horario.service';
import reservaService from '../services/reserva.service';
import servicioService from '../services/servicio.service';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ConfirmacionReservaSlotScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { microempresaId, trabajadorId, servicioId, fecha, trabajadorNombre } = route.params;

  console.log('Datos de la ruta:', route.params);

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duracionServicio, setDuracionServicio] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [clienteId, setClienteId] = useState(null);

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

  

  // Obtener duración del servicio
  useEffect(() => {
    const fetchDuracionServicio = async () => {
      try {
        const response = await servicioService.getServicioById(servicioId);
        setDuracionServicio(response.duracion);
      } catch (error) {
        console.error('Error al obtener la duración del servicio:', error);
      }
    };
    fetchDuracionServicio();
  }, [servicioId]);

  // Obtener horarios disponibles
  
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
          
            // Si no hay trabajador específico, unificar y asignar trabajador aleatorio
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
          
            // Filtrar los slots si la fecha seleccionada es hoy
            const fechaSeleccionada = new Date(fecha);
            const hoy = new Date();
            console.log('Fecha seleccionada:', fechaSeleccionada, 'Hoy:', hoy);

            if (fechaSeleccionada.toISOString().split('T')[0] === hoy.toISOString().split('T')[0]) {
                const horaActual = hoy.getUTCHours() + hoy.getUTCMinutes() / 60; // Hora actual en formato decimal (UTC)
              
                slots = slots.filter((slot) => {
                  const [horaInicio, minutoInicio] = slot.inicio.split(':').map(Number);
                  const horaSlot = horaInicio + minutoInicio / 60; // Hora del slot en formato decimal
                  return horaSlot > horaActual; // Filtrar solo los horarios futuros
                });
              }
              
          
            // Ordenar slots por hora de inicio
            slots.sort((a, b) => a.inicio.localeCompare(b.inicio));
          
            setHorarios(slots);
          } else {
            setError('No hay horarios disponibles.');
          }
          
      } catch (err) {
        console.error('Error al obtener disponibilidad:', err);
        setError('Ocurrió un error al obtener los horarios.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchDisponibilidad();
  }, [trabajadorId, servicioId, fecha, duracionServicio]);
  

  // Función para seleccionar un slot y mostrar el modal
  const handleSlotPress = (slot) => {
    let assignedTrabajador = trabajadorId;
    let assignedTrabajadorNombre = trabajadorNombre;
  
    if (!trabajadorId && slot.trabajadores && slot.trabajadores.length > 0) {
      const randomIndex = Math.floor(Math.random() * slot.trabajadores.length);
      const trabajadorSeleccionado = slot.trabajadores[randomIndex];
      assignedTrabajador = trabajadorSeleccionado._id || trabajadorSeleccionado.id; // Asegúrate de usar el ID correcto
      assignedTrabajadorNombre = trabajadorSeleccionado.nombre || 'Trabajador desconocido'; // Asegúrate que el objeto tenga 'nombre'
    }
  
    setSelectedSlot({ ...slot, trabajadorAsignado: assignedTrabajador, trabajadorNombre: assignedTrabajadorNombre });
    setModalVisible(true);
    console.log('Slot seleccionado:', slot, 'Trabajador asignado:', assignedTrabajadorNombre);
  };
  
  // Confirmar la reserva
  const confirmarReserva = async () => {
    try {
      const reservaData = {
        trabajador: trabajadorId || selectedSlot.trabajadorAsignado, // ID correcto del trabajador
        servicio: servicioId, // ID correcto del servicio
        fecha, // La fecha debe estar en formato correcto
        hora_inicio: selectedSlot.inicio, // Hora de inicio
        cliente: clienteId, // Asegúrate de tener este ID disponible
        estado: 'Activa', // Estado inicial de la reserva
      };
  
      const reserva = await reservaService.createReservaHorario(reservaData);

      if (error) {
        console.error('Error al confirmar reserva:', error);
        return;
      }
  
      console.log('Reserva confirmada:', reserva);
      setModalVisible(false);
      navigation.navigate('Reservas');  // Redirige a la pantalla de reservas
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
    }
  };
  
  

  // Render de error
  if (error) {
    return (
      <View style={styles.containerError}>
        <Text style={styles.errorHeader}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)} style={styles.retryButton}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render de carga
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando disponibilidad...</Text>
      </View>
    );
  }

  // Render principal con los horarios
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un horario</Text>
      <FlatList
                data={horarios}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={<Text>No hay horarios disponibles</Text>}
                renderItem={({ item }) => {
                    console.log("Item:", item); // Verifica que cada slot tenga datos
                    return (
                    <TouchableOpacity
                        style={styles.slotButton}
                        onPress={() => handleSlotPress(item)}
                    >
                        <Text>{`${item.inicio} - ${item.fin}`}</Text>
                    </TouchableOpacity>
                    );
                }}
                />


      {/* Modal de confirmación */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Reserva</Text>
            {selectedSlot && (
                <>
                    <Text>Horario: {selectedSlot.inicio} - {selectedSlot.fin}</Text>
                    <Text>Trabajador asignado: {trabajadorId ? trabajadorNombre : selectedSlot.trabajadorNombre}</Text>
                </>
                )}

            <TouchableOpacity onPress={confirmarReserva} style={styles.confirmButton}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  slotButton: {
    padding: 15,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: { color: 'white', textAlign: 'center' },
  containerError: {
    flex: 1,
    backgroundColor: '#f8d7da', // Fondo rojo claro para errores
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24', // Rojo oscuro para destacar
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007bff', // Azul para el botón "Reintentar"
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#dc3545', // Rojo para el botón "Volver"
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmacionReservaSlotScreen;
