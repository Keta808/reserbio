import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Button, Modal } from 'react-native';
import disponibilidadService from '../services/disponibilidad.service';
import servicioService from '../services/servicio.service';
import { useNavigation, useRoute } from '@react-navigation/native';

const ConfirmacionReservaScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { microempresaId, servicioId, trabajadorId, fecha } = route.params;

  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);

  const [duracionServicio, setDuracionServicio] = useState(null);
  const [excepciones, setExcepciones] = useState([]);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  // --------------------------------------------------
  // 1. OBTENER DURACIÓN DEL SERVICIO
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 2. OBTENER DISPONIBILIDAD
  // --------------------------------------------------
  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!duracionServicio) return;

      try {
        setLoading(true);

        let response;

        // a) Llamar a la función según haya (o no) un trabajadorId
        if (trabajadorId) {
          response = await disponibilidadService.getHorariosDisponibles({
            workerId: trabajadorId,
            date: fecha,
          });
        } else {
          response = await disponibilidadService.getHorariosDisponiblesMicroEmpresa({
            serviceId: servicioId,
            date: fecha,
          });
        }

        console.log('Response recibido:', JSON.stringify(response, null, 2));


        // b) Verificar que 'availableSlots' tenga la forma [ arrayConDatos, maybeError ]
        if (
          response &&
          response.availableSlots &&
          Array.isArray(response.availableSlots) &&
          response.availableSlots.length === 2 // [ data, error ]
        ) {
          const [arrayData, maybeError] = response.availableSlots;

          if (maybeError) {
            // Si el backend reporta un error, lo mostramos y detenemos
            console.error('Error del backend:', maybeError);
            // Aquí podrías setear un state de error o notificar al usuario
            return;
          }

          // Ahora 'arrayData' es un array de objetos con la forma:
          // [
          //   {
          //     trabajador: { id, nombre },
          //     slots: [ { inicio, fin }, ... ]
          //   },
          //   ...
          // ]
          // Queremos unir (o al menos procesar) esos slots
          if (Array.isArray(arrayData) && arrayData.length > 0) {
            // Suponiendo que tomas SOLO el primer trabajador
            // (o que tu backend en realidad regresa un solo objeto)
            // sino, podrías combinar los slots de todos los trabajadores:
            // const allSlots = arrayData.flatMap(item => item.slots);
            // console.log('Todos los slots de todos los trabajadores:', allSlots);

            // En tu código original, solo esperabas un objeto: response.availableSlots[0]
            // Pero ahora lo ajustamos para tomar el PRIMER OBJETO en arrayData
            const firstObj = arrayData[0];
            if (!firstObj.slots) {
              console.error('No se encuentra la propiedad .slots en el primer objeto');
              return;
            }

            // Asumimos que 'excepciones' pudiera estar en firstObj también, si el back la envía
            // si no, la definimos como []
            const excepcionesBase = firstObj.excepciones || [];

            // c) Dividir y filtrar slots
            // En tu código anterior, denominabas a lo que recibías 'slotsBase':
            const slotsBase = firstObj.slots.filter((slot) => slot !== null);
            //console.log('Slots filtrados:', slotsBase);
            //console.log('Excepciones recibidas:', excepcionesBase);

            // Dividir en sub-intervalos según la duración
            const slotsDivididos = dividirEnSlots(slotsBase, duracionServicio, fecha);
           // console.log('Slots divididos: funcion 1', slotsDivididos);

            // Excluir excepciones
            const slotsFiltrados = excluirExcepciones(slotsDivididos, excepcionesBase);
            //console.log('Slots filtrados: funcion 2', slotsFiltrados);

            // Filtrar slots si ya pasaron
            const slotsFuturos = filtrarSlotsFuturos(slotsFiltrados, fecha);
            //console.log('filtrare slots futuros', slotsFuturos);

            setDisponibilidad(slotsFuturos);
            setExcepciones(excepcionesBase);
          } else {
            console.error('No hay disponibilidad en arrayData:', arrayData);
          }
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

  // --------------------------------------------------
  // 3. FUNCIONES AUXILIARES
  // --------------------------------------------------

  // a) Dividir en slots según la duración
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
    console.log('Slots divididos:', slots);
    return slots;
  };

  // b) Excluir slots que estén dentro de excepciones
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

  // c) Filtrar slots que ya pasaron si es la misma fecha que hoy
  const filtrarSlotsFuturos = (slots, fechaSeleccionada) => {
    if (!fechaSeleccionada) {
      console.error('Error: fechaSeleccionada es undefined.');
      return [];
    }

    const fechaReferencia = new Date(fechaSeleccionada);
    const ahoraUTC = new Date();
    const offsetChile = -3 * 60 * 60 * 1000; // Chile UTC-3
    const ahoraLocal = new Date(ahoraUTC.getTime() + offsetChile);

    if (isNaN(fechaReferencia.getTime()) || isNaN(ahoraLocal.getTime())) {
      console.error(`Error: fechaSeleccionada (${fechaSeleccionada}) o la fecha actual no son válidas.`);
      return [];
    }

    // Solo filtrar si el día de la fecha seleccionada es igual al día actual en Chile
    const esHoy = fechaReferencia.toDateString() === ahoraLocal.toDateString();
    if (esHoy) {
      console.log('📌 Filtrando slots porque la fecha seleccionada es HOY');
      return slots.filter(({ inicio }) => convertirAFecha(inicio, fechaReferencia) > ahoraLocal);
    } else {
      console.log('✅ No se aplica filtro porque la fecha es en otro día');
      return slots; // Si la fecha es diferente, no filtramos nada
    }
  };

  // d) Convertir una string HH:mm en objeto Date (para un día dado)
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

    return new Date(
      fechaReferencia.getFullYear(),
      fechaReferencia.getMonth(),
      fechaReferencia.getDate(),
      horas,
      minutos,
      0
    );
  };

  // e) Formatear fecha (objeto Date) a HH:mm
  const formatHora = (fecha) => {
    return fecha.toTimeString().split(' ')[0].substring(0, 5);
  };

  // --------------------------------------------------
  // 4. SELECCIÓN DE TRABAJADOR SI NO HAY PREFERENCIA
  // --------------------------------------------------
  const seleccionarTrabajadorAleatorio = async (slot) => {
    // Si el usuario seleccionó un trabajador puntual, no necesitamos asignar uno
    if (trabajadorId) {
      setSelectedTrabajador({ id: trabajadorId });
      return;
    }

    try {
      // Llamamos a la API para saber qué trabajadores están disponibles en esa hora
      const response = await disponibilidadService.getTrabajadoresDisponiblesPorHora({
        serviceId: servicioId,
        date: fecha,
        hora: slot.inicio,
      });

      // Elegimos uno aleatorio
      if (response && response.trabajadoresDisponibles && response.trabajadoresDisponibles.length > 0) {
        const trabajadorAleatorio =
          response.trabajadoresDisponibles[
            Math.floor(Math.random() * response.trabajadoresDisponibles.length)
          ];
        setSelectedTrabajador(trabajadorAleatorio);
      } else {
        console.error('No hay trabajadores disponibles en este horario:', response);
      }
    } catch (error) {
      console.error('Error al obtener trabajadores disponibles:', error);
    }
  };

  // --------------------------------------------------
  // 5. FUNCIONES DE LA UI
  // --------------------------------------------------
  const handleSelectSlot = async (slot) => {
    setSelectedSlot(slot);
    await seleccionarTrabajadorAleatorio(slot);
    setModalVisible(true);
  };

  const handleConfirmarReserva = () => {
    if (!selectedTrabajador) {
      console.error('Error: No se ha asignado un trabajador');
      return;
    }

    // Aquí se podría crear la reserva en el backend si fuera necesario
    console.log(
      `Reserva confirmada para el horario ${selectedSlot?.inicio} - ${
        selectedSlot?.fin
      } con el trabajador ${selectedTrabajador?.nombre || selectedTrabajador?.id}`
    );
    setModalVisible(false);
  };

  // --------------------------------------------------
  // RENDERIZADO
  // --------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando disponibilidad...</Text>
      </View>
    );
  }

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
              onPress={() => handleSelectSlot(item)}
            >
              <Text style={styles.slotText}>
                {item.inicio} - {item.fin}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noAvailability}>No hay horarios disponibles.</Text>
      )}

      {/* Modal de confirmación */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {selectedTrabajador?.nombre
                ? `¿Confirmar reserva para ${selectedSlot?.inicio} - ${selectedSlot?.fin} con ${selectedTrabajador?.nombre}?`
                : `¿Confirmar reserva para ${selectedSlot?.inicio} - ${selectedSlot?.fin}?`}
            </Text>
            <View style={styles.modalButtons}>
              <Button title="Confirmar" onPress={handleConfirmarReserva} />
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                color="red"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Botón de retroceso */}
      <View style={styles.buttonContainer}>
        <Button title="Atras" onPress={() => navigation.goBack()} color="#dc3545" />
      </View>
    </View>
  );
};

// --------------------------------------------------
//  ESTILOS
// --------------------------------------------------
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
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
  },
});

export default ConfirmacionReservaScreen;
