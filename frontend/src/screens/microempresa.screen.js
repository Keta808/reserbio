import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Button,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { Image } from "expo-image";
import MicroempresaService from "../services/microempresa.service";
import ServiciosService from "../services/servicio.service";
import { useFocusEffect } from "@react-navigation/native";

export default function MicroempresaScreen({ route, navigation }) {
  const { id, userId } = route.params || {};
  const [microempresa, setMicroempresa] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [montoAbono, setMontoAbono] = useState({});

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
  // Fetch servicios
  const fetchServicios = async () => { 
    try {
      
      const response = await ServiciosService.getServiciosByMicroempresaId(id);
      if (response.state === "Success" && Array.isArray(response.data)) {
        setServicios(response.data);
      }
    } catch (error) {
      console.error("Error al obtener los servicios:", error.message);
    }

  };
  // Calcular Monto abono 
  useEffect(()=> {
    
    const obtenerMontosAbono = async () => {
      let newMontos = {}; 
      for (let servicio of servicios){
        if(servicio.porcentajeAbono && servicio.porcentajeAbono > 0) {
          try {
            const monto = await ServiciosService.calcularMontoAbono(servicio._id, servicio.precio, servicio.porcentajeAbono);
            newMontos[servicio._id] = monto.data;
          } catch (error) {
            console.error("Error al calcular el monto de abono:", error.message);
          }
        }
      }
      setMontoAbono(newMontos);
    };
    obtenerMontosAbono();
  }, [servicios]);

  // Función para eliminar una imagen
  const handleDeleteImage = (publicId) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar esta imagen?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Llama al servicio para eliminar la imagen
              await MicroempresaService.eliminarImagen(id, publicId);
              Alert.alert("Éxito", "Imagen eliminada correctamente");

              // Actualiza el estado eliminando la imagen de la galería local
              setMicroempresa((prev) => ({
                ...prev,
                imagenes: prev.imagenes.filter((img) => img.public_id !== publicId),
              }));
            } catch (error) {
              console.error("Error al eliminar imagen:", error);
              Alert.alert("Error", "No se pudo eliminar la imagen.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Usando useFocusEffect para refrescar cada vez que la pantalla se enfoque
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      Promise.all([fetchMicroempresa(), fetchFotoPerfil(), fetchServicios()]).finally(() => setLoading(false));
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
        data={[]} // Evita que los trabajadores se dupliquen en la lista principal
        keyExtractor={() => "flatlist_microempresa"} // 👈 Clave única para evitar errores
        ListHeaderComponent={
          <View style={styles.container}>
            {/* 📸 Foto de perfil */}
            <View style={styles.imageContainer}>
              {fotoPerfilUrl ? (
                <Image
                  source={{ uri: `${fotoPerfilUrl}?time=${new Date().getTime()}` }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.placeholderText}>Imagen no disponible</Text>
              )}
            </View>
  
            {/* 📝 Datos de la microempresa */}
            <View style={styles.sectionContainer}>
              <Text style={styles.title}>{microempresa.nombre || "Sin nombre"}</Text>
              <Text style={styles.description}>{microempresa.descripcion || "Sin descripción"}</Text>
  
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>📞 <Text style={styles.infoLabel}>Teléfono:</Text> {microempresa.telefono || "Sin teléfono"}</Text>
                <Text style={styles.infoText}>📍 <Text style={styles.infoLabel}>Dirección:</Text> {microempresa.direccion || "Sin dirección"}</Text>
                <Text style={styles.infoText}>✉️ <Text style={styles.infoLabel}>Correo:</Text> {microempresa.email || "Sin email"}</Text>
                <Text style={styles.infoText}>🏷️ <Text style={styles.infoLabel}>Categoría:</Text> {microempresa.categoria || "Sin categoría"}</Text>
              </View>
  
              {/* 🛠️ Botón "Editar Microempresa" debajo de los datos */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Editar Microempresa"
                  onPress={() => navigation.navigate("EditarMicroempresa", { id, userId, modo: "editar" })}
                  color="#007BFF"
                />
              </View>
            </View>
  
            {/* ✅ Servicios Ofrecidos */}
<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Servicios Ofrecidos</Text>
  
  {/* ✅ Mostrar los servicios si existen */}
  {servicios.length > 0 ? (
    servicios.map((servicio) => (
      <View key={servicio._id} style={styles.servicioItem}>
        <Text style={styles.servicioName}>{servicio.nombre}</Text>
        <Text style={styles.servicioDetail}>Precio: ${servicio.precio}</Text>
        <Text style={styles.servicioDetail}>{servicio.descripcion}</Text>
        {montoAbono[servicio._id] && montoAbono[servicio._id] > 0 && (
          <Text style={styles.servicioAbono}>Abono para reservar: ${montoAbono[servicio._id]}</Text>
        )}
      </View>
    ))
  ) : (
    <Text style={styles.servicioDetail}>No hay servicios registrados aún.</Text>
  )}

  {/* ⚙️ Botón "Configurar Servicios" SIEMPRE visible */}
  <View style={styles.buttonContainer}>
    <Button
      title="Configurar Servicios"
      onPress={() => navigation.navigate("Servicio", { id })}
      color="green"
    />
  </View>
</View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 10, marginBottom: 20 }}>
            {/* 🏢 Trabajadores */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Trabajadores</Text>
  
              {/* 🔄 Muestra los trabajadores correctamente con una clave única */}
              {microempresa.trabajadores.length > 0 ? (
                <FlatList
                  data={microempresa.trabajadores}
                  key={"flatlist_trabajadores"} // 👈 Clave única para evitar el error
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => navigation.navigate("Trabajador", { trabajador: item })}
                    >
                      <Text style={styles.cardTitle}>{item.nombre}</Text>
                      <Text style={styles.cardDetail}>{item.telefono}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                />
              ) : (
                <Text style={styles.noImagesText}>No hay trabajadores aún.</Text>
              )}
  
              {/* ✅ Botón "Invitar Trabajador" ahora está debajo de los trabajadores */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Invitar Trabajador"
                  onPress={() => navigation.navigate("InvitarTrabajador", { idMicroempresa: id })}
                  color="#28a745" // Verde
                />
              </View>
            </View>
  
            {/* 📂 Galería */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Galería</Text>
              <View style={styles.galleryContainer}>
                {microempresa.imagenes.length > 0 ? (
                  <FlatList
                    data={microempresa.imagenes}
                    horizontal
                    keyExtractor={(item) => item.public_id}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    renderItem={({ item }) => (
                      <View style={styles.galleryImageContainer}>
                        <Image
                          source={{ uri: item.url }}
                          style={styles.galleryImage}
                          contentFit="cover"
                        />
                        <TouchableOpacity
                          style={styles.deleteImageButton}
                          onPress={() => handleDeleteImage(item.public_id)}
                        >
                          <Text style={styles.deleteImageButtonText}>X</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noImagesText}>No hay imágenes disponibles</Text>
                )}
              </View>
  
              {/* 🖼️ Botón para añadir imágenes */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Añadir Imágenes"
                  onPress={() => navigation.navigate("SubirImagenes", { id })}
                />
              </View>
            </View>
  
            {/* 📌 Botones finales: Reservar y Volver al Inicio */}
            <View style={styles.buttonContainer}>
              <Button
                title="Reservar"
                onPress={() => navigation.navigate("Reservar", { id, userId })}
                color="red"
              />
              <Button
                title="Volver al Inicio"
                onPress={() => navigation.navigate("HomeNavigator")}
                color="#007BFF"
              />
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 5,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10, // Para dar margen a todo el contenido
  },
  sectionContainer: {
    marginBottom: 1, // 📌 Espaciado uniforme entre secciones
    paddingHorizontal: 10,
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
  infoContainer: {
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
  infoLabel: {
    fontWeight: "bold",
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
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  servicioItem: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    width: "95%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  servicioName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  servicioDetail: {
    fontSize: 14,
    color: "#666",
  },
  servicioAbono: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 5,
  },
  galleryContainer: {
    marginBottom: 10,
  },
  galleryImageContainer: {
    position: "relative",
    marginRight: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  deleteImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF3B30",
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteImageButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noImagesText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "gray",
  },
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
});

