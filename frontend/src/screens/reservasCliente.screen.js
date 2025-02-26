import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  Animated, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import valoracionService from '../services/valoracion.service';
import { AntDesign } from '@expo/vector-icons';

const ReservaClienteScreen = () => {
  const navigation = useNavigation();
  const [clienteId, setClienteId] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtro para mostrar reservas 'Activas' o 'Finalizadas'
  const [filtro, setFiltro] = useState('Activas');
  const animacion = new Animated.Value(filtro === 'Activas' ? 0 : 1);

  // Estado para el modal de confirmación al cancelar
  const [modalVisible, setModalVisible] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchClienteId = async () => {
        try {
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const parsedData = JSON.parse(userData);
            setClienteId(parsedData.id);
            fetchReservas(parsedData.id);
          }
        } catch (error) {
          console.error('Error al obtener datos de AsyncStorage:', error);
        }
      };
      fetchClienteId();
    }, [])
  );

  const fetchReservas = async (id) => {
    try {
      setLoading(true);
      const response = await reservaService.getReservasByCliente(id);
      const reservasConValoracion = await Promise.all(
        response.data.map(async (reserva) => {
          const valoracionResponse = await valoracionService.existeValoracionPorReserva(reserva._id);
          return { ...reserva, tieneValoracion: valoracionResponse.existe };
        })
      );
      setReservas(reservasConValoracion || []);
    } catch (error) {
      console.error('Error al obtener las reservas del cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear la fecha y horas de la reserva
  const formatReserva = (reserva) => {
    // Se toma la hora de inicio y se le suma la duración (en minutos) para obtener la hora de término.
    const inicioDate = new Date(reserva.hora_inicio);
    const finDate = new Date(inicioDate.getTime() + reserva.duracion * 60000);
    // Formateo: "nombre del día, DD de MMMM de YYYY"
    const formattedDate = inicioDate.toLocaleDateString('es-ES', { 
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
    });
    const formattedInicio = inicioDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const formattedFin = finDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate}\n${formattedInicio} -  ${formattedFin}`;
  };

  const reservasFiltradas = reservas
    .filter((reserva) => {
      if (reserva.estado === 'Cancelada') return false;
      return filtro === 'Activas' ? reserva.estado === 'Activa' : reserva.estado === 'Finalizada';
    })
    .sort((a, b) => {
      if (filtro === 'Finalizadas') {
        return new Date(b.fecha) - new Date(a.fecha); // Orden descendente
      }
      return 0;
    });

  // Cambia el filtro y anima el switch
  const cambiarFiltro = () => {
    const nuevoFiltro = filtro === 'Activas' ? 'Finalizadas' : 'Activas';
    setFiltro(nuevoFiltro);
    Animated.timing(animacion, {
      toValue: nuevoFiltro === 'Activas' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Mostrar modal de confirmación antes de cancelar una reserva
  const confirmarCancelacion = (id) => {
    setReservaSeleccionada(id);
    setModalVisible(true);
  };

  // Ejecutar la cancelación de la reserva
  const cancelarReserva = async () => {
    if (reservaSeleccionada) {
      try {
        await reservaService.cancelReserva(reservaSeleccionada);
        fetchReservas(clienteId);
      } catch (error) {
        console.error('Error al cancelar la reserva:', error);
      } finally {
        setModalVisible(false);
        setReservaSeleccionada(null);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Reservas</Text>

      {/* Switch de filtro personalizado */}
      <View style={styles.switchContainer}>
        <TouchableOpacity onPress={cambiarFiltro} style={styles.switch}>
          <Animated.View
            style={[
              styles.switchIndicator,
              {
                left: animacion.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['5%', '55%'],
                }),
              },
            ]}
          />
          <Text style={[styles.switchText, filtro === 'Activas' && styles.activeText]}>
            Activas
          </Text>
          <Text style={[styles.switchText, filtro === 'Finalizadas' && styles.activeText]}>
            Finalizadas
          </Text>
        </TouchableOpacity>
      </View>

      {reservasFiltradas.length > 0 ? (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.reservaItem}>
              <Text style={styles.reservaText}>{formatReserva(item)}</Text>
              <Text style={styles.reservaSubText}>Servicio: {item.servicio.nombre}</Text>
              <Text style={styles.reservaSubText}>
                Trabajador: {item.trabajador.nombre} {item.trabajador.apellido}
              </Text>
              <Text
                style={[
                  styles.estado,
                  item.estado === 'Activa' ? styles.estadoActiva : styles.estadoFinalizada,
                ]}
              >
                {item.estado}
              </Text>

              {item.estado === 'Activa' && (
                <TouchableOpacity
                  onPress={() => confirmarCancelacion(item._id)}
                  style={styles.cancelButton}
                >
                  <AntDesign name="closecircle" size={24} color="red" />
                </TouchableOpacity>
              )}
              {item.estado === 'Finalizada' && !item.tieneValoracion && (
                <TouchableOpacity
                  style={styles.valoracionButton}
                  onPress={() => navigation.navigate('Valoracion', { reserva: item, clienteId })}
                >
                  <Text style={styles.valoracionButtonText}>Valorar Servicio</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noReservas}>
          No tienes reservas {filtro.toLowerCase()}.
        </Text>
      )}

      {/* Modal de confirmación para cancelar reserva */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Seguro que deseas cancelar esta reserva?</Text>
            <View style={styles.modalButtons}>
             
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.modalCloseButton]}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelarReserva}
                style={[styles.modalButton, styles.modalCancelButton]}
              >
                <Text style={styles.modalButtonText}>Cancelar Reserva</Text>
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
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  switch: {
    width: '80%',
    height: 50,
    backgroundColor: '#ddd',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
    overflow: 'hidden',
  },
  switchIndicator: {
    position: 'absolute',
    width: '40%',
    height: '80%',
    backgroundColor: '#34c759',
    borderRadius: 25,
    top: '10%',
  },
  switchText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    zIndex: 2,
  },
  activeText: {
    color: '#fff',
  },
  reservaItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  reservaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reservaSubText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  estado: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  estadoActiva: {
    color: 'green',
  },
  estadoFinalizada: {
    color: 'blue',
  },
  noReservas: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  cancelButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  valoracionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  valoracionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: '40%',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'red',
  },
  modalCloseButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});

export default ReservaClienteScreen;
