import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  Animated, 
  TouchableOpacity, 
  Modal, 
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import valoracionService from '../services/valoracion.service';
import { AntDesign } from '@expo/vector-icons';
import paymentService from '../services/payment.services.js';
import { useTheme } from '../context/theme.context';

const ReservaClienteScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [clienteId, setClienteId] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtro para mostrar reservas 'Activas' o 'Finalizadas'
  const [filtro, setFiltro] = useState('Activas');
  const animacion = new Animated.Value(filtro === 'Activas' ? 0 : 1);

  // Estados para el modal de confirmación
  const [modalVisible, setModalVisible] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'cancel' o 'delete'
  const [confirming, setConfirming] = useState(false); // Evita múltiples pulsaciones

  // Estados para el modal de valoración
  const [modalValoracionVisible, setModalValoracionVisible] = useState(false);
  const [valoracionDetalle, setValoracionDetalle] = useState(null);

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
      console.log('Reservas del cliente:', response.data);
      const reservasConValoracion = await Promise.all(
        response.data.map(async (reserva) => {
          const valoracionResponse = await valoracionService.existeValoracionPorReserva(reserva._id);
          console.log('Valoración de la reserva:', valoracionResponse);
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
    const inicioDate = new Date(reserva.hora_inicio);
    const finDate = new Date(inicioDate.getTime() + reserva.duracion * 60000);
    const formattedDate = inicioDate.toLocaleDateString('es-ES', { 
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
    });
    const formattedInicio = inicioDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const formattedFin = finDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate}\n${formattedInicio} - ${formattedFin}`;
  };

  const reservasFiltradas = reservas
    .filter((reserva) => {
      if (reserva.estado === 'Cancelada') return false;
      return filtro === 'Activas' 
        ? reserva.estado === 'Activa' 
        : reserva.estado === 'Finalizada' || reserva.estado === 'Realizada';
    })
    .sort((a, b) => {
      if (filtro === 'Finalizadas') {
        return new Date(b.fecha) - new Date(a.fecha);
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

  // Mostrar modal de confirmación para cancelar
  const confirmarCancelacion = (id) => {
    setReservaSeleccionada(id);
    setModalVisible(true);
    setModalAction('cancel');
  };

  // Mostrar modal de confirmación para eliminar
  const confirmarEliminacion = (id) => {
    setReservaSeleccionada(id);
    setModalVisible(true);
    setModalAction('delete');
  };

  // Ejecutar la cancelación de la reserva
  const cancelarReserva = async () => {
    if (reservaSeleccionada && !confirming) {
      setConfirming(true);
      try { 
        await reservaService.cancelReservaCliente(reservaSeleccionada);
        fetchReservas(clienteId);
      } catch (error) {
        console.error('Error al cancelar la reserva:', error);
      } finally {
        setModalVisible(false);
        setReservaSeleccionada(null);
        setModalAction(null);
        setConfirming(false);
      }
    }
  };

  // Ejecutar la eliminación definitiva de la reserva
  const eliminarReserva = async () => {
    if (reservaSeleccionada && !confirming) {
      setConfirming(true);
      try {
        await reservaService.deleteReserva(reservaSeleccionada);
        fetchReservas(clienteId);
      } catch (error) {
        console.error('Error al eliminar la reserva:', error);
      } finally {
        setModalVisible(false);
        setReservaSeleccionada(null);
        setModalAction(null);
        setConfirming(false);
      }
    }
  };

  // Función para ver la valoración de una reserva
  const handleVerValoracion = async (reservaId) => {
    try {
      const response = await valoracionService.getValoracionPorIdReserva(reservaId);
      console.log("Respuesta de valoración:", response);
      // Si la respuesta tiene la data en response.data, la usamos; sino, usamos response directamente
      const data = response.data ? response.data : response;
      setValoracionDetalle(data);
      setModalValoracionVisible(true);
    } catch (error) {
      console.error("Error al obtener la valoración", error);
      Alert.alert("Error", "No se pudo obtener la valoración");
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={{ color: theme.text }}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Mis Reservas</Text>

      {/* Switch de filtro personalizado */}
      <View style={styles.switchContainer}>
        <TouchableOpacity
          onPress={cambiarFiltro}
          style={[styles.switch, { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" }]}
        >
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
          <Text style={[styles.switchText, { color: theme.text }, filtro === 'Activas' && styles.activeText]}>
            Activas
          </Text>
          <Text style={[styles.switchText, { color: theme.text }, filtro === 'Finalizadas' && styles.activeText]}>
            Finalizadas
          </Text>
        </TouchableOpacity>
      </View>

      {reservasFiltradas.length > 0 ? (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.reservaItem,
                { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" },
                item.estado === 'Finalizada' && styles.reservaItemFinalizada,
              ]}
            >
              <Text style={[styles.reservaText, { color: theme.text }]}>{formatReserva(item)}</Text>
              <Text style={[styles.reservaSubText, { color: theme.text }]}>
                Servicio: {item.servicio.nombre}
              </Text>
              <Text style={[styles.reservaSubText, { color: theme.text }]}>
                Trabajador: {item.trabajador.nombre} {item.trabajador.apellido}
              </Text>
              <Text
                style={[
                  styles.estado,
                  item.estado === 'Activa' ? styles.estadoActiva : styles.estadoFinalizada,
                  { color: theme.text },
                ]}
              >
                {item.estado}
              </Text>

              {item.estado === 'Activa' && (
                <TouchableOpacity onPress={() => confirmarCancelacion(item._id)} style={styles.cancelButton}>
                  <AntDesign name="closecircle" size={24} color="red" />
                </TouchableOpacity>
              )}

              {(item.estado === 'Finalizada' || item.estado === 'Realizada') && (
                <>
                  <TouchableOpacity onPress={() => confirmarEliminacion(item._id)} style={styles.cancelButton}>
                    <AntDesign name="closecircle" size={24} color="red" />
                  </TouchableOpacity>
                  {item.estado === 'Realizada' && (
                    item.tieneValoracion ? (
                      <TouchableOpacity style={styles.valoracionButton} onPress={() => handleVerValoracion(item._id)}>
                        <Text style={styles.valoracionButtonText}>Ver Valoración</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.valoracionButton}
                        onPress={() => navigation.navigate('Valoracion', { reserva: item, clienteId })}
                      >
                        <Text style={styles.valoracionButtonText}>Valorar Servicio</Text>
                      </TouchableOpacity>
                    )
                  )}
                </>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={[styles.noReservas, { color: theme.text }]}>
          No tienes reservas {filtro.toLowerCase()}.
        </Text>
      )}

     {/* Modal de confirmación para cancelar o eliminar reserva */}
<Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalContainer}>
    <View
      style={[
        styles.modalContent,
        { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" },
      ]}
    >
      <Text style={[styles.modalText, { color: theme.text }]}>
        {modalAction === 'cancel'
          ? '¿Seguro que deseas cancelar esta reserva?'
          : '¿Seguro que deseas eliminar definitivamente esta reserva?'}
      </Text>
      <View style={styles.modalButtons}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
            setReservaSeleccionada(null);
            setModalAction(null);
          }}
          style={[styles.modalButton]}
        >
          <Text style={styles.modalButtonText}>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (modalAction === 'cancel') {
              cancelarReserva();
            } else if (modalAction === 'delete') {
              eliminarReserva();
            }
          }}
          style={[
            styles.modalButton,
            modalAction === 'cancel'
              ? styles.modalCancelButton
              : styles.modalDeleteButton,
            confirming && { opacity: 0.5 },
          ]}
          disabled={confirming}
        >
          <Text style={styles.modalButtonText}>
            {confirming
              ? modalAction === 'cancel'
                ? 'Confirmando'
                : 'Eliminando'
              : modalAction === 'cancel'
              ? 'Cancelar Reserva'
              : 'Eliminar Reserva'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

{/* Modal para mostrar la valoración de la reserva */}
<Modal visible={modalValoracionVisible} transparent animationType="fade">
  <View style={styles.modalContainer}>
    <View
      style={[
        styles.modalContent,
        { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Valoración del Servicio
      </Text>
      <View style={styles.modalRatingContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <AntDesign
            key={i}
            name={i < (valoracionDetalle?.puntuacion || 0) ? "star" : "staro"}
            size={24}
            color="#FFD700"
          />
        ))}
      </View>
      <Text style={[styles.modalComment, { color: theme.text }]}>
        {valoracionDetalle?.comentario || "Sin comentario"}
      </Text>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => setModalValoracionVisible(false)}
      >
        <Text style={styles.modalButtonText}>Cerrar</Text>
      </TouchableOpacity>
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
    position: 'relative',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
    height: 160,
  },
  reservaItemFinalizada: {
    paddingBottom: 50,
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
    marginVertical: 3,
  },
  estado: {
    position: 'absolute', 
    bottom: 10, 
    left: 10,
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
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
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
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalComment: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  // Botón unificado para ambos modales
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: '40%',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Opcionales: colores específicos para acciones de cancelación/eliminación
  modalCancelButton: {
    backgroundColor: 'red',
  },
  modalDeleteButton: {
    backgroundColor: 'red',
  },
});

export default ReservaClienteScreen;
    