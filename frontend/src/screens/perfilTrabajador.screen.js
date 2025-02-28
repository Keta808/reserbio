import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/auth.context';

export default function PerfilTrabajadorScreen({ route }) {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth(); // 🔹 Verifica si el usuario está autenticado
  const [trabajador, setTrabajador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrabajador = async () => {
      try {
        if (!isAuthenticated) {
          return; // Si ya se cerró sesión, no hacer nada
        }

        const storedUser = await AsyncStorage.getItem('user');
        if (!storedUser) {
          throw new Error('No se encontró usuario en AsyncStorage.');
        }
        setTrabajador(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al obtener datos del trabajador:', error);
        if (isAuthenticated) { // Solo mostrar error si sigue autenticado
          Alert.alert('Error', 'No se pudo cargar la información del trabajador.');
        }
        navigation.navigate('HomeTrabajador');
      } finally {
        setLoading(false);
      }
    };

    fetchTrabajador();
  }, [isAuthenticated]); // 🔹 Se ejecuta solo si el usuario sigue autenticado

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!trabajador) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No se pudo cargar la información del trabajador.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil del Trabajador</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{trabajador.nombre || 'Sin nombre'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Apellido:</Text>
        <Text style={styles.value}>{trabajador.apellido || 'Sin apellido'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Teléfono:</Text>
        <Text style={styles.value}>{trabajador.telefono || 'Sin teléfono'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Reservar"
          onPress={() => navigation.navigate('Reservar', { trabajadorId: trabajador.id })}
          color="blue"
        />
        <Button
          title="Volver al Inicio"
          onPress={() => navigation.navigate('HomeTrabajador')}
          color="#007BFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  value: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
  },
});

