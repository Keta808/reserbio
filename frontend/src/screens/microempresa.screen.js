import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import MicroempresaService from '../services/microempresa.service';

export default function InicioMicroempresaScreen({ route }) {
  const { id } = route.params; // 🆔 Recibe el ID de la microempresa seleccionada
  const [microempresa, setMicroempresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMicroempresa = async () => {
      try {
        const response = await MicroempresaService.getMicroempresaData(id);
        setMicroempresa(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener datos de la microempresa:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos de la microempresa');
        setLoading(false);
      }
    };

    fetchMicroempresa();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {microempresa ? (
        <>
          {microempresa.fotoPerfil && (
            <Image source={{ uri: microempresa.fotoPerfil.url }} style={styles.profileImage} />
          )}

          <Text style={styles.title}>{microempresa.nombre}</Text>
          <Text style={styles.description}>{microempresa.descripcion}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{microempresa.telefono}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dirección:</Text>
            <Text style={styles.infoValue}>{microempresa.direccion}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{microempresa.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoría:</Text>
            <Text style={styles.infoValue}>{microempresa.categoria}</Text>
          </View>

          {microempresa.trabajadores && microempresa.trabajadores.length > 0 ? (
            <View style={styles.trabajadoresContainer}>
              <Text style={styles.sectionTitle}>Trabajadores:</Text>
              {microempresa.trabajadores.map((trabajador, index) => (
                <View key={index} style={styles.trabajadorCard}>
                  <Text style={styles.trabajadorNombre}>
                    {trabajador.nombre} {trabajador.apellido}
                  </Text>
                  <Text style={styles.trabajadorContacto}>{trabajador.email}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.infoValue}>No hay trabajadores registrados.</Text>
          )}
        </>
      ) : (
        <Text style={styles.error}>No se encontraron datos de la microempresa.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  infoValue: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
  },
  trabajadoresContainer: {
    width: '100%',
    marginTop: 10,
  },
  trabajadorCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  trabajadorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trabajadorContacto: {
    fontSize: 14,
    color: 'gray',
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
});
