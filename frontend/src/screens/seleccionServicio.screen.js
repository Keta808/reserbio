import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import servicioService from '../services/servicio.service.js';

const SeleccionServicioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { microempresaId, trabajadores } = route.params; // Recibe el ID de la microempresa

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const data = await servicioService.getServiciosByMicroempresaId(microempresaId);
        const serviciosArray = data.data;
        setServicios([...serviciosArray]); // Forzar nueva referencia
      } catch (err) {
        console.error('Error al obtener los servicios:', err);
        setError('No se pudo conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [microempresaId]);

  const handleTrabajadorSelect = (trabajadorId) => {
    console.log('Trabajador seleccionado (ID):', trabajadorId);
    setSelectedTrabajadorId(trabajadorId);
  };

  const handleContinue = () => {
    navigation.navigate('ConfirmacionReserva', {
      microempresaId,
      servicioId: selectedServicio.id || selectedServicio._id,
      trabajadorId: selectedTrabajadorId,
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando servicios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selecciona un servicio</Text>
      <FlatList
        data={servicios}
        keyExtractor={(item, index) => item.id?.toString() || item._id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, selectedServicio?.id === item.id && styles.selectedCard]}
            onPress={() => setSelectedServicio(item)}
          >
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardSubtitle}>{item.duracion} min</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.subHeader}>Selecciona un trabajador</Text>
      <FlatList
        data={[...trabajadores.map(item => ({ id: item._id, nombre: item.nombre })), { id: null, nombre: 'No tengo preferencia' }]}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => {
          console.log('Renderizando trabajador (ID):', item.id);
          return (
            <TouchableOpacity
              style={[styles.card, selectedTrabajadorId === item.id && styles.selectedCard]}
              onPress={() => handleTrabajadorSelect(item.id)}
            >
              <Text style={styles.cardTitle}>{item.nombre || 'Sin nombre definido'}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Continuar"
          onPress={handleContinue}
          disabled={!selectedServicio || selectedTrabajadorId === null}
          color="#007bff"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
   marginTop:100,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#d1e7dd',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
  },
});

export default SeleccionServicioScreen;
