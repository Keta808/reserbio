import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Button } from 'react-native';
import MicroempresaService from '../services/microempresa.service';

export default function ListaMicroempresasScreen({ navigation }) {
  const [microempresas, setMicroempresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMicroempresas = async () => {
      try {
        //console.log('📥 Fetching microempresas...');
        const response = await MicroempresaService.getMicroempresas();
        if (response.data) {
          //console.log('📋 Microempresas obtenidas:', response.data);
          setMicroempresas(response.data);
        } else {
          Alert.alert('Error', 'No se encontraron microempresas.');
        }
      } catch (error) {
        console.error('❌ Error al obtener microempresas:', error.message);
        Alert.alert('Error', 'Ocurrió un error al cargar las microempresas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMicroempresas();
  }, []);

  const renderMicroempresa = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MicroempresaCliente', { id: item._id })}
      >
        {/* Información de la microempresa */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.nombre || 'Sin nombre'}</Text>
          <Text style={styles.details}>{item.direccion || 'Sin dirección'}</Text>
          <Text style={styles.details}>{item.telefono || 'Sin teléfono'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Cargando microempresas...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={microempresas}
      renderItem={renderMicroempresa}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      ListFooterComponent={
        <View style={styles.footer}>
          <Button
            title="Volver al Inicio"
            onPress={() => navigation.navigate('HomeNavigator')}
            color="#007BFF"
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
  footer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
});
