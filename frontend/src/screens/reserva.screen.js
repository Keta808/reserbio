import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReservationDetails = ({ route }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.details}>Horario: {item.time}</Text>
      <Text style={styles.details}>Cliente ID: {item.cliente}</Text>
      <Text style={styles.details}>Servicio ID: {item.servicio}</Text>
      <Text style={styles.details}>Duración: {item.duracion} minutos</Text>
      <Text style={styles.details}>Estado: {item.estado}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default ReservationDetails;
