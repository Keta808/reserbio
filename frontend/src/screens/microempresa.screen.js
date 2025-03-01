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
import ServiciosService from "../services/servicio.service";
import MicroempresaService from "../services/microempresa.service";
import { useFocusEffect } from "@react-navigation/native";
import EnlaceService from "../services/enlace.service";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from "../context/auth.context";

export default function MicroempresaScreen({ route, navigation }) {

  const { id, userId } = route.params || {};
  const [microempresa, setMicroempresa] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [montoAbono, setMontoAbono] = useState({});
  const { user } = useAuth();

  // Funciones de fetch definidas fuera o dentro del componente...
  const fetchMicroempresa = async () => {
    try {
      console.log("📥 Fetching microempresa with ID:", id)  ;
        if (!id) {
            Alert.alert("Error", "No se proporcionó el ID de la microempresa.");
            setLoading(false);
            return;
        }

        // 📌 Obtener datos de la microempresa
        const responseMicroempresa = await MicroempresaService.getMicroempresaData(id);
        if (!responseMicroempresa) {
            console.warn("⚠️ Respuesta inesperada del servicio:", responseMicroempresa);
            Alert.alert("Error", "No se pudieron cargar los datos de la microempresa.");
            return;
        }

        // 📌 Obtener los trabajadores con `enlaceId`
        const responseTrabajadores = await EnlaceService.obtenerTrabajadoresMicroempresa(id);
        if (!responseTrabajadores || !responseTrabajadores.data) {
            console.warn("⚠️ No se pudieron obtener los trabajadores correctamente.");
            Alert.alert("Error", "No se pudieron cargar los trabajadores.");
            return;
        }

        // 📌 Fusionar datos: agregar los trabajadores con `enlaceId`
        const microempresaActualizada = {
            ...responseMicroempresa.data,
            trabajadores: responseTrabajadores.data, // Sustituimos la lista de trabajadores por la versión con enlaceId
        };

        console.log("📌 Microempresa con trabajadores actualizados:", microempresaActualizada);
        setMicroempresa(microempresaActualizada);

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

  const handleDeleteTrabajador = (trabajador) => {
    if (!trabajador.enlaceId) {
      console.error("❌ Error: enlaceId no definido para este trabajador:", trabajador);
      Alert.alert("Error", "No se pudo encontrar el enlace del trabajador.");
      return;
    }
  
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres desvincular a ${trabajador.nombre}?`,
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
              // 📌 Llamamos a la función del servicio para desvincular
              console.log("🚨 Solicitando desvinculación del trabajador con enlace ID:", trabajador.enlaceId);
              await EnlaceService.desvincularTrabajador(trabajador.enlaceId);
              
              Alert.alert("Éxito", "Trabajador desvinculado correctamente");
  
              // 📌 Actualizamos el estado para reflejar el cambio en la UI
              setMicroempresa((prev) => ({
                ...prev,
                trabajadores: prev.trabajadores.filter((t) => t.enlaceId !== trabajador.enlaceId),
              }));
            } catch (error) {
              console.error("❌ Error al desvincular trabajador:", error);
              Alert.alert("Error", "No se pudo desvincular el trabajador.");
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
  console.log("📌 Lista de trabajadores con enlaceId:", microempresa.trabajadores);

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
  onPress={() => navigation.navigate("EditarMicroempresa", { id, userId: user?.id, modo: "editar" })}
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
                  keyExtractor={(item) => item.enlaceId || item._id} // Evita claves nulas
                  numColumns={2} 
                  renderItem={({ item }) => (
                    <View style={styles.trabajadorCard}>
                      {/* 📌 Verifica que los datos no sean nulos */}
                      <TouchableOpacity
                        style={styles.trabajadorInfo}
                        onPress={() => navigation.navigate("Trabajador", { trabajador: item })}
                      >
                        <Text style={styles.cardTitle}>{item.nombre || "Sin nombre"}</Text>
                        <Text style={styles.cardDetail}>{item.telefono || "Sin teléfono"}</Text>
                      </TouchableOpacity>
                
                      {/* ✅ Corrección: Botón de eliminar con Icon */}
                      <TouchableOpacity
                        style={styles.deleteTrabajadorButton}
                        onPress={() => handleDeleteTrabajador(item)}
                      >
                        <Ionicons name="trash-outline" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                
              
                           
              
              ) : (
                <Text style={styles.noImagesText}>No hay trabajadores aún.</Text>
              )}
  
              {/* ✅ Botón "Invitar Trabajador" ahora está debajo de los trabajadores */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Invitar Trabajador**"
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
                
                      {/* 🗑️ Botón de eliminar imagen */}
                      <TouchableOpacity
                        style={styles.deleteTrabajadorButton}
                        onPress={() => handleDeleteImage(item.public_id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="white" />
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
  
            <Button
              title="Volver al Inicio"
              onPress={() => {
              navigation.reset({
              index: 0,
              routes: [{ name: "HomeNavigator" }],
                });
              }}
              color="#007BFF"
            />

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
    backgroundColor: "transparent", // 📌 Sin fondo para solo mostrar el icono
  },
  
  deleteImageIcon: {
    fontSize: 22, // 📌 Tamaño adecuado para la imagen
    color: "#FF3B30", // 📌 Rojo para destacar
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
  deleteTrabajadorButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF3B30",
    width: 25, // 📌 Tamaño más pequeño
    height: 25,
    borderRadius: 12.5, // 📌 Asegura que sea un círculo
    alignItems: "center",
    justifyContent: "center",
  },
  
  deleteTrabajadorIcon: {
    fontSize: 16, // 📌 Ajusta el tamaño del icono
    color: "white",
  },
  trabajadorCard: {
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
    position: "relative",
  },  
  
});

