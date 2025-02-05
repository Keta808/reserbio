import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Button,
  Modal,
  Platform,
} from 'react-native';
import disponibilidadService from '../services/disponibilidad.service';
import reservaService from '../services/reserva.service';
import servicioService from '../services/servicio.service';
import { useNavigation, useRoute } from '@react-navigation/native';

const ConfirmacionReservaScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { microempresaId, servicioId, trabajadorId, fecha } = route.params;
  // fecha: "YYYY-MM-DD"

  console.log("Fecha en confirmacion reserva", fecha);

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

        // b) Verificar que 'availableSlots' tenga la forma [ arrayConDatos, maybeError ]
        if (
          response &&
          response.availableSlots &&
          Array.isArray(response.availableSlots) &&
          response.availableSlots.length === 2 // [ data, error ]
        ) {
          const [arrayData, maybeError] = response.availableSlots;

          if (maybeError) {
            console.error('Error del backend:', maybeError);
            return; // Podrías setear un estado de error
          }

          // --- OPCIÓN 1: Cuando arrayData es un ARRAY (varios trabajadores)
          if (Array.isArray(arrayData) && arrayData.length > 0) {
            const firstObj = arrayData[0];
            if (!firstObj.slots) {
              console.error('No se encuentra la propiedad .slots en el primer objeto');
              return;
            }
            const excepcionesBase = firstObj.excepciones || [];
            const slotsBase = firstObj.slots.filter((slot) => slot !== null);

            const slotsDivididos = dividirEnSlots(slotsBase, duracionServicio, fecha);
            const slotsFiltrados = excluirExcepciones(slotsDivididos, excepcionesBase);
            const slotsFuturos = filtrarSlotsFuturos(slotsFiltrados, fecha);

            setDisponibilidad(slotsFuturos);
            setExcepciones(excepcionesBase);

          // --- OPCIÓN 2: Cuando arrayData es un OBJETO (un solo trabajador)
          } else if (
            typeof arrayData === 'object' &&
            arrayData !== null &&
            Array.isArray(arrayData.availableSlots)
          ) {
            const slotsBase = arrayData.availableSlots.filter((slot) => slot !== null);
            const excepcionesBase = arrayData.excepciones || [];

            const slotsDivididos = dividirEnSlots(slotsBase, duracionServicio, fecha);
            const slotsFiltrados = excluirExcepciones(slotsDivididos, excepcionesBase);
            const slotsFuturos = filtrarSlotsFuturos(slotsFiltrados, fecha);

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

  /**
   * PARTE A:
   * parseYmdToLocalDate - Fuerza un método para iOS y otro para Android
   */
  function parseYmdToLocalDate(ymd) {
    const [year, month, day] = ymd.split('-').map(Number);

    // Creamos la fecha en hora local
    let localMidnight = new Date(year, month - 1, day, 0, 0, 0);

    if (Platform.OS === 'android') {
      // "Arreglito" sumando el offset para compensar que Android a veces parsea como UTC
      // Efectivamente estamos diciendo: "si la hora local es 00:00, súmale offset"
      // con lo cual se forzaría la medianoche local a esa misma "medianoche" sin restar horas.
      const offsetInMinutes = localMidnight.getTimezoneOffset(); // Ej: 180 (si UTC-3)
      localMidnight = new Date(
        localMidnight.getTime() - offsetInMinutes * 60 * 1000
      );
    }

    // Para iOS no hacemos nada extra
    return localMidnight;
  }

  /**
   * isSameDayLocal - compara solo año, mes y día
   */
  function isSameDayLocal(dateA, dateB) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  // a) Dividir en slots según la duración
  const dividirEnSlots = (intervalos, duracion, fechaBaseStr) => {
    if (!duracion) {
      console.log('Error: La duración del servicio no está definida.');
      return [];
    }

    let slots = [];

    intervalos.forEach(({ inicio, fin }) => {
      let horaInicio = convertirAFecha(inicio, fechaBaseStr);
      let horaFin = convertirAFecha(fin, fechaBaseStr);

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

  // c) Filtrar slots que ya pasaron si es la misma fecha que HOY
  const filtrarSlotsFuturos = (slots, fechaSeleccionada) => {
    console.log('Filtrando slots futuros...');
    console.log('Fecha seleccionada:', fechaSeleccionada);

    if (!fechaSeleccionada) {
      console.error('Error: fechaSeleccionada es undefined.');
      return [];
    }

    // 1) con parseYmdToLocalDate
    const fechaRef = parseYmdToLocalDate(fechaSeleccionada); // medianoche "local"

    // 2) "ahora" local (sin hack)
    const ahora = new Date();

    console.log('Fecha de referencia:', fechaRef);
    console.log('Fecha actual local:', ahora);

    // si es el mismo día => filtrar
    const esHoy = isSameDayLocal(fechaRef, ahora);
    if (esHoy) {
      console.log('📌 Filtrando slots porque la fecha seleccionada es HOY');
      return slots.filter(({ inicio }) => {
        const slotHora = convertirAFecha(inicio, fechaRef);
        return slotHora > ahora;
      });
    } else {
      console.log('✅ No se aplica filtro porque la fecha es en otro día');
      return slots;
    }
  };

  /**
   * d) Convertir "HH:mm" + una "base" (que puede ser string "YYYY-MM-DD" o un Date)
   *    en un Date local.
   */
  const convertirAFecha = (horaStr, fechaBase) => {
    if (!horaStr) {
      console.error(`Error: horaStr es inválido (${horaStr})`);
      return null;
    }

    const [horas, minutos] = horaStr.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) {
      console.error(`Error: horaStr tiene un formato incorrecto (${horaStr})`);
      return null;
    }

    let base;
    if (typeof fechaBase === 'string') {
      // => parseamos "YYYY-MM-DD" con la función que distingue iOS/Android
      base = parseYmdToLocalDate(fechaBase);
    } else {
      // => ya es un Date
      base = new Date(fechaBase);
    }

    if (isNaN(base.getTime())) {
      console.error(`Error: fechaBase es inválida (${fechaBase})`);
      return null;
    }

    // Ajustamos la hora/minutos sobre esa fecha local
    base.setHours(horas, minutos, 0, 0);
    return base;
  };

  // e) Formatear fecha (objeto Date) a "HH:mm"
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
        date: fecha, // "YYYY-MM-DD"
        hora: slot.inicio, // "HH:mm"
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

  const handleConfirmarReserva = async () => {
    if (!selectedTrabajador) {
      console.error('Error: No se ha asignado un trabajador');
      return;
    }
  
    try {
      // Aquí definimos el objeto que se enviará al backend
      // Ajusta los nombres de campos según tu modelo o DTO de reserva en el backend
      const nuevaReserva = {
        hora_inicio: selectedSlot.inicio,  // "08:00", etc.
        fecha,                             // "2025-01-31", etc.
        cliente: "670c0bcd3d2afb84d758ebde",         // Ajusta para obtener el ID real del cliente
        trabajador: selectedTrabajador.id, // ID del trabajador asignado
        servicio: servicioId,              // ID del servicio
        estado: "Activa",                  // o el estado que manejes
      };
  
      // Si tu backend necesita también 'hora_fin', podrías usar selectedSlot.fin
      // nuevaReserva.hora_fin = selectedSlot.fin;
  
      // Llamamos al servicio que crea la reserva en el backend
      const respuesta = await reservaService.createReserva(nuevaReserva);
      console.log('Reserva creada correctamente:', respuesta);
  
      // Cierra el modal o navega a otra pantalla después de crear la reserva
      setModalVisible(false);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      // Maneja el error en la UI si lo deseas (mostrar un alert, setear un estado, etc.)
    }
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
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="red" />
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
