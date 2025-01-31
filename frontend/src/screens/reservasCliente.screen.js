import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reservaService from '../services/reserva.service';
import { useNavigation } from '@react-navigation/native';

const ReservaClienteScreen = () => {
  const navigation = useNavigation();
  const [clienteId, setClienteId] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClienteId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setClienteId(parsedData.id); // ✅ Guardamos el clienteId en el estado
          fetchReservas(parsedData.id);
        } else {
          console.error('⚠️ No se encontraron datos de usuario en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener datos de AsyncStorage:', error);
      }
    };

    fetchClienteId();
  }, []);

  const fetchReservas = async (id) => {
    try {
      setLoading(true);
      const response = await reservaService.getReservasByCliente(id);
      console.log('Reservas del cliente:', response);
      setReservas(response.data || []);
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

      {reservas.length > 0 ? (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.reservaItem}>
              <Text style={styles.reservaText}>{formatDateTime(item.fecha, item.hora_inicio)}</Text>
              <Text style={styles.reservaSubText}>Servicio: {item.servicio.nombre}</Text>
              <Text style={styles.reservaSubText}>Trabajador: {item.trabajador.nombre} {item.trabajador.apellido}</Text>
              <Text style={[styles.estado, item.estado === 'Activa' ? styles.estadoActiva : styles.estadoCancelada]}>
                {item.estado}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noReservas}>No tienes reservas activas.</Text>
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
  reservaItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  estadoCancelada: {
    color: 'red',
  },
  noReservas: {
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
});

export default ReservaClienteScreen;
