import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function PerfilTrabajadorScreen({ route, navigation }) {
  const { trabajador } = route.params || {};

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
          onPress={() => navigation.navigate('Reservar', { trabajadorId: trabajador._id })}
          color="blue"
        />
        <Button
          title="Volver al Inicio"
          onPress={() => navigation.navigate('HomeNavigator')}
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
});

