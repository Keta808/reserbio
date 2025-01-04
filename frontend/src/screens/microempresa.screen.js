import React, { use, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import HeaderTitle from '../components/HeaderTitle.component.js';
import { obtenerMicroempresas } from '../services/microempresa.service.js';

const MicroempresaInicioScreen = () => {
  const [microempresa, setMicroempresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMicroempresa = async () => {
      try {
        const data = await obtenerMicroempresas(); // Llamada a la API para obtener la microempresa
        if (data.state === 'Success' && Array.isArray(data.data)) {  // Verificar que 'data.data' sea un arreglo
          setMicroempresa(data.data); // Almacenar la microempresa en el estado
        }
      } catch (error) {
        console.error('Error al obtener la microempresa:', error.message);
        setError('Error al obtener la microempresa. Intente de nuevo más tarde.');
      } finally {
        setLoading(false); // Terminar el loading después de la llamada
      }
    };
    fetchMicroempresa();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <HeaderTitle title={microempresa.nombre || 'Inicio Microempresa'} />
      <Text style={styles.text}>Descripción: {microempresa.descripcion}</Text>
      <Text style={styles.text}>Teléfono: {microempresa.telefono}</Text>
      <Text style={styles.text}>Dirección: {microempresa.direccion}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#f8f9fa',
    marginVertical: 4,
  },
  error: {
    fontSize: 16,
    color: 'red',
    TextAlign: 'center',
  }
});

export default MicroempresaInicioScreen;
 