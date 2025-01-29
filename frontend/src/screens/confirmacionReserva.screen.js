import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ConfirmacionReservaScreen = () => {
  const route = useRoute();
  const { microempresaId, servicioId, trabajadorId } = route.params; // Recibe los datos enviados

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirmación de Reserva</Text>
      <Text style={styles.label}>Microempresa ID:</Text>
      <Text style={styles.value}>{microempresaId}</Text>
      <Text style={styles.label}>Servicio ID:</Text>
      <Text style={styles.value}>{servicioId}</Text>
      <Text style={styles.label}>Trabajador ID:</Text>
      <Text style={styles.value}>{trabajadorId ? trabajadorId : 'No tengo preferencia'}</Text>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    marginTop: 8,
    color: '#333',
  },
});

export default ConfirmacionReservaScreen;
