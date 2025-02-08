import React, { useEffect, useState, useCallback } from 'react'; 
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button, Animated, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import valoracionService from '../services/valoracion.service';

// test 
import { AntDesign } from '@expo/vector-icons';

const ReservaClienteScreen = () => {
  const navigation = useNavigation();
  const [clienteId, setClienteId] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el filtro actual ('Activas' o 'Finalizadas')
  const [filtro, setFiltro] = useState('Activas');
  const animacion = new Animated.Value(filtro === 'Activas' ? 0 : 1);

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
      const reservasConValoracion = await Promise.all(response.data.map(async (reserva) => {
        const valoracionResponse = await valoracionService.existeValoracionPorReserva(reserva._id);
        return { ...reserva, tieneValoracion: valoracionResponse.existe };
      }));
      setReservas(reservasConValoracion || []);
    } catch (error) {
      console.error('Error al obtener las reservas del cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (fechaISO, hora) => {
    const dateObj = new Date(fechaISO);
    const formattedDate = dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = new Date(hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} - ${formattedTime}`;
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    if (reserva.estado === 'Cancelada') return false;
    return filtro === 'Activas' ? reserva.estado === 'Activa' : reserva.estado === 'Finalizada';
  });

  // Función para cambiar el filtro y animar el switch
  const cambiarFiltro = () => {
    const nuevoFiltro = filtro === 'Activas' ? 'Finalizadas' : 'Activas';
    setFiltro(nuevoFiltro);
    Animated.timing(animacion, {
      toValue: nuevoFiltro === 'Activas' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Cancelar reservas
  const cancelarReserva = async (id) => {
    try {
      await reservaService.cancelReserva(id);
      console.log('Reserva cancelada:', id);
      fetchReservas(clienteId);
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
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

      {/* Switch personalizado */}
      <View style={styles.switchContainer}>
        <TouchableOpacity onPress={cambiarFiltro} style={styles.switch}>
        <Animated.View
              style={[
                styles.switchIndicator,
                {
                  transform: [
                    {
                      translateX: animacion.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 150], // Ajusta el desplazamiento para cubrir el 50% del switch
                      }),
                    },
                  ],
                },
              ]}
            />
          <Text style={[styles.switchText, filtro === 'Activas' && styles.activeText]}>Activas</Text>
          <Text style={[styles.switchText, filtro === 'Finalizadas' && styles.activeText]}>Finalizadas</Text>
        </TouchableOpacity>
      </View>

      {reservasFiltradas.length > 0 ? (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.reservaItem}>
              <Text style={styles.reservaText}>
                {formatDateTime(item.fecha, item.hora_inicio)}
              </Text>
              <Text style={styles.reservaSubText}>
                Servicio: {item.servicio.nombre}
              </Text>
              <Text style={styles.reservaSubText}>
                Trabajador: {item.trabajador.nombre} {item.trabajador.apellido}
              </Text>
              <Text
                style={[
                  styles.estado,
                  item.estado === 'Activa' ? styles.estadoActiva : styles.estadoFinalizada
                ]}
              >
                {item.estado}
              </Text>
              
              {item.estado === 'Activa' && (
              <TouchableOpacity onPress={() => cancelarReserva(item._id)} style={styles.cancelButton}>
                <AntDesign name="closecircle" size={24} color="red" />
              </TouchableOpacity>
            )}
              {item.estado === 'Finalizada' && !item.tieneValoracion && (
                <Button
                  title="Valorar Servicio"
                  onPress={() => navigation.navigate('Valoracion', { reserva: item, clienteId })}
                  color="#28a745"
                />
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noReservas}>
          No tienes reservas {filtro.toLowerCase()}.
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Atrás" onPress={() => navigation.goBack()} color="#dc3545" />
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  switch: {
    width: '80%', // Ocupa el 80% del ancho de la pantalla
    height: 50, // Altura ajustada
    backgroundColor: '#ddd', // Fondo gris claro para el switch
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden', // Evita desbordes visuales
  },
  switchIndicator: {
    position: 'absolute',
    width: '50%', // El indicador ocupa la mitad del ancho del switch
    height: '100%', // Cubre todo el alto del switch
    backgroundColor: '#34c759', // Verde para el indicador
    borderRadius: 25,
    zIndex: 1, // Asegura que el indicador esté detrás del texto
  },
  switchText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16, // Tamaño de fuente
    fontWeight: 'bold',
    color: '#000', // Texto gris claro
    zIndex: 2, // Asegura que el texto esté encima del indicador
  },
  activeText: {
    color: '#fff', // Texto blanco cuando está activo
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
  },
  reservaSubText: {
    fontSize: 14,
    color: '#666',
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
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
  },
  cancelButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default ReservaClienteScreen;
