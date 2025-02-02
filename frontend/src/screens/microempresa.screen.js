import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, Button, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { Image } from "expo-image";
import MicroempresaService from "../services/microempresa.service";
import { useFocusEffect } from '@react-navigation/native';


export default function MicroempresaScreen({ route, navigation }) {
  const { id, userId } = route.params || {};
  const [microempresa, setMicroempresa] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);

// Funciones de fetch definidas fuera o dentro del componente...
const fetchMicroempresa = async () => {
  try {
    if (!id) {
      Alert.alert("Error", "No se proporcionó el ID de la microempresa.");
      setLoading(false);
      return;
    }

    console.log("📥 Fetching microempresa with ID:", id);
    const response = await MicroempresaService.getMicroempresaData(id);

    if (response) {
      console.log("📋 Datos de la microempresa obtenidos:", response);
      setMicroempresa(response.data);
    } else {
      console.warn("⚠️ Respuesta inesperada del servicio:", response);
      Alert.alert("Error", "No se pudieron cargar los datos de la microempresa.");
    }
  } catch (error) {
    console.error("❌ Error al obtener los datos de la microempresa:", error.message);
    Alert.alert("Error", "No se pudieron cargar los datos de la microempresa.");
  }
};

const fetchFotoPerfil = async () => {
  try {
    console.log(`🔍 Solicitando foto de perfil para la microempresa con ID: ${id}`);
    const fotoPerfil = await MicroempresaService.getMicroempresaFotoPerfil(id);
    console.log("📸 Foto de perfil recibida:", fotoPerfil);
    setFotoPerfilUrl(fotoPerfil);
  } catch (error) {
    console.error("❌ Error al obtener la foto de perfil:", error);
  }
};

// Usando useFocusEffect para refrescar cada vez que la pantalla se enfoque
useFocusEffect(
  React.useCallback(() => {
    // Si deseas que se muestre un loading, puedes setearlo aquí
    setLoading(true);
    Promise.all([fetchMicroempresa(), fetchFotoPerfil()]).finally(() => setLoading(false));
  }, [id])
);


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
    <SafeAreaView style={styles.safeArea}>
    <FlatList
      data={microempresa.trabajadores}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Trabajador", { trabajador: item })}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardDetail}>{item.telefono}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item._id}
      numColumns={2}
      ListHeaderComponent={
        <View style={styles.container}>
          {/* 📸 Foto de perfil */}
          <View style={styles.imageContainer}>
            {fotoPerfilUrl ? (
              <Image source={{ uri: `${fotoPerfilUrl}?time=${new Date().getTime()}` }} style={styles.image} resizeMode="cover" />
            ) : (
              <Text style={styles.placeholderText}>Imagen no disponible</Text>
            )}
          </View>

          {/* 📝 Datos de la microempresa */}
          <Text style={styles.title}>{microempresa.nombre || "Sin nombre"}</Text>
          <Text style={styles.description}>{microempresa.descripcion || "Sin descripción"}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>📞 <Text style={styles.infoLabel}>Teléfono:</Text> {microempresa.telefono || "Sin teléfono"}</Text>
            <Text style={styles.infoText}>📍 <Text style={styles.infoLabel}>Dirección:</Text> {microempresa.direccion || "Sin dirección"}</Text>
            <Text style={styles.infoText}>✉️ <Text style={styles.infoLabel}>Correo:</Text> {microempresa.email || "Sin email"}</Text>
            <Text style={styles.infoText}>🏷️ <Text style={styles.infoLabel}>Categoría:</Text> {microempresa.categoria || "Sin categoría"}</Text>
          </View>


          {/* 🏢 Trabajadores */}
          <Text style={styles.sectionTitle}>Trabajadores</Text>
        </View>
      }
      ListFooterComponent={
        <View style={{ paddingHorizontal: 10, marginBottom: 20 }}>
          {/* 📂 Galería */}
          <Text style={styles.sectionTitle}>Galería</Text>
          <View style={styles.galleryContainer}>
            {microempresa.imagenes.length > 0 ? (
              <FlatList
                data={microempresa.imagenes}
                horizontal
                keyExtractor={(item) => item.public_id}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.url }} style={styles.galleryImage} contentFit="cover" />
                )}
              />
            ) : (
              <Text style={styles.noImagesText}>No hay imágenes disponibles</Text>
            )}
          </View>
      
          {/* Botón de Añadir Imágenes con margen superior */}
          <View style={{ marginTop: 10 }}>
            <Button title="Añadir Imágenes" onPress={() => navigation.navigate("SubirImagenes", { id })} />
          </View>
      
          <View style={styles.buttonContainer}>
            <Button
              title="Editar Microempresa"
              onPress={() => navigation.navigate("EditarMicroempresa", { id, userId, modo: "editar" })}
            />
            <Button title="Reservar" onPress={() => navigation.navigate("Reservar", { id, userId })} color="red" />
            <Button title="Volver al Inicio" onPress={() => navigation.navigate("HomeNavigator")} color="#007BFF" />
          </View>
        </View>
      }
      contentContainerStyle={styles.listContainer}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 5,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10, // Para dar margen a todo el contenido
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    margin: 5,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardDetail: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  galleryContainer: {
    marginBottom: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  noImagesText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  // Estilos faltantes:
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: "gray",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginTop: 20,
  },
});

