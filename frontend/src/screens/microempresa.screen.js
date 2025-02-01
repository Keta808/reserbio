import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, Button, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import MicroempresaService from '../services/microempresa.service';

export default function MicroempresaScreen({ route, navigation }) {
  const { id, userId } = route.params || {};
  const [microempresa, setMicroempresa] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setMicroempresa(response.data);
        } else {
          console.warn('⚠️ Respuesta inesperada del servicio:', response);
          Alert.alert('Error', 'No se pudieron cargar los datos de la microempresa.');
        }
      } catch (error) {
        console.error('❌ Error al obtener los datos de la microempresa:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los datos de la microempresa.');
      }
    };

    const fetchFotoPerfil = async () => {
      try {
        console.log(`🔍 Solicitando foto de perfil para la microempresa con ID: ${id}`);
        const fotoPerfil = await MicroempresaService.getMicroempresaFotoPerfil(id);
        console.log('📸 Foto de perfil recibida:', fotoPerfil);
        setFotoPerfilUrl(fotoPerfil);
      } catch (error) {
        console.error('❌ Error al obtener la foto de perfil:', error);
      }
    };

    fetchMicroempresa();
    fetchFotoPerfil();
    setLoading(false);
  }, [id]);

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
    <FlatList
      data={microempresa.trabajadores}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Trabajador', { trabajador: item })}
        >
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardDetail}>{item.telefono}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item._id}
      numColumns={2}
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            {fotoPerfilUrl ? (
              <Image
                source={{ uri: `${fotoPerfilUrl}?time=${new Date().getTime()}` }}
                style={styles.image}
                resizeMode="cover"
                onError={() => console.log("❌ Error al cargar la imagen de perfil")}
              />
            ) : (
              <Text style={styles.placeholderText}>Imagen no disponible</Text>
            )}
          </View>

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

          <Text style={styles.sectionTitle}>Trabajadores</Text>
        </View>
      }
      ListFooterComponent={
        <View style={styles.buttonContainer}>
          <Button 
            title="Editar Microempresa" 
            onPress={() => {
            console.log("🛠 Navegando a edición con ID:", id, "y userID:", userId);
            navigation.navigate('EditarMicroempresa', { id, userId, modo: "editar" });
            }} 
        />
          <Button title="Reservar" onPress={() => navigation.navigate('Reservar', { id, userId })} color="red" />
          <Button title="Volver al Inicio" onPress={() => navigation.navigate('HomeNavigator')} color="#007BFF" />
        </View>
      }
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },  
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDetail: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 1,
    textAlign: 'left',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  }  
});



