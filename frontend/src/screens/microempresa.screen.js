import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, ScrollView, Button, ImageBackground } from 'react-native';
import MicroempresaService from '../services/microempresa.service';

export default function MicroempresaScreen({ route, navigation }) {
  const { id, userId } = route.params || {}; // Recibe parámetros desde SeleccionMicroempresaScreen
  const [microempresa, setMicroempresa] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos de la microempresa
  useEffect(() => {
    const fetchMicroempresa = async () => {
      try {
        if (!id) {
          Alert.alert('Error', 'No se proporcionó el ID de la microempresa.');
          setLoading(false);
          return;
        }
  
        console.log('📥 Fetching microempresa with ID:', id);
        const response = await MicroempresaService.getMicroempresaData(id);
  
        if (response) {
          console.log('📋 Datos de la microempresa obtenidos:', response);
          setMicroempresa(response.data); // Cambiado para usar el objeto correcto
        } else {
          console.warn('⚠️ Respuesta inesperada del servicio:', response);
          Alert.alert('Error', 'No se pudieron cargar los datos de la microempresa.');
        }
      } catch (error) {
        console.error('❌ Error al obtener los datos de la microempresa:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los datos de la microempresa.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchMicroempresa();
  }, [id]);  

  // Renderizar la foto de perfil con dimensiones explícitas
  /* const renderFotoPerfil = () => {
    if (microempresa?.fotoPerfil?.url && typeof microempresa.fotoPerfil.url === 'string') {
      return (
        <Image
          source={{ uri: microempresa.fotoPerfil.url }}
          style={styles.profileImage}
        />
      );
    } else {
      console.warn('⚠️ Foto de perfil no válida o ausente:', microempresa?.fotoPerfil);
      // Muestra un placeholder si no hay imagen
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Sin foto de perfil</Text>
        </View>
      );
    }
  }; */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando datos de la microempresa...</Text>
      </View>
    );
  }
  
  if (!microempresa) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>No se pudieron cargar los datos de la microempresa.</Text>
      </View>
    );
  }  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      

      <Text style={styles.title}>{microempresa.nombre || 'Sin nombre'}</Text>
      <Text style={styles.description}>{microempresa.descripcion || 'Sin descripción'}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Teléfono:</Text>
        <Text style={styles.infoValue}>{microempresa.telefono || 'Sin teléfono'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Dirección:</Text>
        <Text style={styles.infoValue}>{microempresa.direccion || 'Sin dirección'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{microempresa.email || 'Sin email'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Categoría:</Text>
        <Text style={styles.infoValue}>{microempresa.categoria || 'Sin categoría'}</Text>
      </View>

      <Button
        title="Editar Microempresa"
        onPress={() => navigation.navigate('EditarMicroempresa', { id, userId })}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Volver al Inicio"
          onPress={() => navigation.navigate('HomeNavigator')}
          color="#007BFF"
        />
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
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
    width: 150, // Tamaño explícito de la imagen
    height: 150,
    borderRadius: 75, // Imagen circular
    marginBottom: 20,
  },
  placeholderContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
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
});

