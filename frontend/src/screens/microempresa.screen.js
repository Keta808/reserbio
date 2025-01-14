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
          {/* Mostrar foto de perfil si existe */}
          {microempresa.fotoPerfil && (
            <Image source={{ uri: microempresa.fotoPerfil.url }} style={styles.profileImage} />
          )}

          <Text style={styles.title}>{microempresa.nombre}</Text>
          <Text style={styles.description}>{microempresa.descripcion}</Text>

          <View style={styles.infoWrapper}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{microempresa.telefono}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{microempresa.direccion}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{microempresa.email}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>{microempresa.categoria}</Text>
            </View>
          </View>

          {/* Mostrar trabajadores si existen */}
          {microempresa.trabajadores && microempresa.trabajadores.length > 0 ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Trabajadores:</Text>
              {microempresa.trabajadores.map((trabajador, index) => (
                <Text key={index} style={styles.infoValue}>- {trabajador.nombre}</Text>
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
  infoWrapper: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  infoValue: {
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
});
