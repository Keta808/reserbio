import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Button,Modal } from 'react-native';
import disponibilidadService from '../services/disponibilidad.service';
import servicioService from '../services/servicio.service';
import { useNavigation, useRoute } from '@react-navigation/native';

const ConfirmacionReservaScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { microempresaId, servicioId, trabajadorId, fecha } = route.params;
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duracionServicio, setDuracionServicio] = useState(null);
  const [excepciones, setExcepciones] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const fetchDuracionServicio = async () => {
      try {
        const response = await servicioService.getServicioById(servicioId);
        console.log('Duración del servicio obtenida:', response.duracion);
        setDuracionServicio(response.duracion);
      } catch (error) {
        console.error('Error al obtener la duración del servicio:', error);
      }
    };

    fetchDuracionServicio();
  }, [servicioId]);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!duracionServicio) return;

      try {
        setLoading(true);
        let data;
        let response;

        if (trabajadorId) {
          data = { workerId: trabajadorId, date: fecha };
          response = await disponibilidadService.getHorariosDisponibles(data);
        } else {
          data = { servicioId, fecha };
          response = await disponibilidadService.getHorariosDisponiblesMicroEmpresa(data);
        }

        console.log('Response recibido:', JSON.stringify(response, null, 2));

        if (
          response &&
          response.availableSlots &&
          Array.isArray(response.availableSlots) &&
          response.availableSlots.length > 0 &&
          Array.isArray(response.availableSlots[0].availableSlots)
        ) {
          const slotsBase = response.availableSlots[0].availableSlots.filter((slot) => slot !== null);
          const excepcionesBase = response.availableSlots[0].excepciones || [];

          console.log('Slots filtrados:', slotsBase);
          console.log('Excepciones recibidas:', excepcionesBase);

          const slotsDivididos = dividirEnSlots(slotsBase, duracionServicio, fecha);
          const slotsFiltrados = excluirExcepciones(slotsDivididos, excepcionesBase);

          setDisponibilidad(filtrarSlotsFuturos(slotsFiltrados, fecha));
          setExcepciones(excepcionesBase);
        } else {
          console.error('El formato de la respuesta no es válido:', response);
        }
      } catch (error) {
        console.error('Error al obtener la disponibilidad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibilidad();
  }, [trabajadorId, servicioId, fecha, duracionServicio]);

  const dividirEnSlots = (intervalos, duracion, fechaBase) => {
    if (!duracion) {
      console.log('Error: La duración del servicio no está definida.');
      return [];
    }

    let slots = [];

    intervalos.forEach(({ inicio, fin }) => {
      let horaInicio = convertirAFecha(inicio, fechaBase);
      let horaFin = convertirAFecha(fin, fechaBase);

      if (!horaInicio || !horaFin) {
        console.error('Error: Fecha inválida al dividir en slots.', { inicio, fin });
        return;
      }

      while (horaInicio < horaFin) {
        let horaSlotFin = new Date(horaInicio.getTime() + duracion * 60000);
        if (horaSlotFin > horaFin) break;

        slots.push({
          inicio: formatHora(horaInicio),
          fin: formatHora(horaSlotFin),
        });

        horaInicio = horaSlotFin;
      }
    });

    return slots;
  };

  const excluirExcepciones = (slots, excepciones) => {
    return slots.filter(({ inicio, fin }) => {
      return !excepciones.some(({ inicio_no_disponible, fin_no_disponible }) => {
        return (
          (inicio >= inicio_no_disponible && inicio < fin_no_disponible) ||
          (fin > inicio_no_disponible && fin <= fin_no_disponible)
        );
      });
    });
  };

  const filtrarSlotsFuturos = (slots, fechaSeleccionada) => {
    if (!fechaSeleccionada) {
      console.error("Error: fechaSeleccionada es undefined.");
      return [];
    }

    const ahora = new Date();
    const fechaReferencia = new Date(fechaSeleccionada);

    if (isNaN(fechaReferencia.getTime())) {
      console.error(`Error: fechaSeleccionada (${fechaSeleccionada}) no es una fecha válida.`);
      return [];
    }

    return slots.filter(({ inicio }) => convertirAFecha(inicio, fechaReferencia) > ahora);
  };

  const convertirAFecha = (horaStr, fechaBase = new Date()) => {
    if (!horaStr) {
      console.error(`Error: horaStr es inválido (${horaStr})`);
      return null;
    }

    const [horas, minutos] = horaStr.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) {
      console.error(`Error: horaStr tiene un formato incorrecto (${horaStr})`);
      return null;
    }

    const fechaReferencia = fechaBase ? new Date(fechaBase) : new Date();
    if (isNaN(fechaReferencia.getTime())) {
      console.error(`Error: fechaBase es inválida (${fechaBase})`);
      return null;
    }

    return new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), fechaReferencia.getDate(), horas, minutos, 0);
  };

  const formatHora = (fecha) => {
    return fecha.toTimeString().split(' ')[0].substring(0, 5);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando disponibilidad...</Text>
      </View>
    );
  }


  const handleConfirmarReserva = () => {
    console.log(`Reserva confirmada para el horario ${selectedSlot?.inicio} - ${selectedSlot?.fin}`);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un horario</Text>
      {disponibilidad.length > 0 ? (
        <FlatList
          data={disponibilidad}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
            style={[styles.slotButton, selectedSlot === item && styles.selectedSlot]}
            onPress={() => {
              setSelectedSlot(item);
              setModalVisible(true); // Asegurar que el modal se muestre
            }}
          >
              <Text style={styles.slotText}>{item.inicio} - {item.fin}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noAvailability}>No hay horarios disponibles.</Text>
      )}


      {/* MODAL DE CONFIRMACIÓN */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Confirmar reserva para {selectedSlot?.inicio} - {selectedSlot?.fin}?</Text>
            <View style={styles.modalButtons}>
              <Button title="Confirmar" onPress={handleConfirmarReserva} />
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <Button title="Atras" onPress={() => navigation.goBack()} color="#dc3545" />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,

    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 120,
    textAlign: 'center',
  },
  slotButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSlot: {
    backgroundColor: '#d1e7dd',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  slotText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noAvailability: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default ConfirmacionReservaScreen;
