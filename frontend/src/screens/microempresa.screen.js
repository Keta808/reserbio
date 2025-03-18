import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { Image } from "expo-image";
import ImageViewing from "react-native-image-viewing";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/theme.context";

import ServiciosService from "../services/servicio.service";
import MicroempresaService from "../services/microempresa.service";
import EnlaceService from "../services/enlace.service";
import { useAuth } from "../context/auth.context";

export default function MicroempresaScreen({ route }) {
  const { id, userId } = route.params || {};
  const [microempresa, setMicroempresa] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [montoAbono, setMontoAbono] = useState({});
  const { user } = useAuth();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  // Estado para visor de imagen
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const fetchMicroempresa = async () => {
    try {
      console.log("📥 Fetching microempresa with ID:", id);
      if (!id) {
        Alert.alert("Error", "No se proporcionó el ID de la microempresa.");
        setLoading(false);
        return;
      }
      const responseMicroempresa = await MicroempresaService.getMicroempresaData(id);
      if (!responseMicroempresa || !responseMicroempresa.data) {
        console.warn("⚠️ Respuesta inesperada del servicio:", responseMicroempresa);
        Alert.alert("Error", "No se pudieron cargar los datos de la microempresa.");
        return;
      }
      const responseTrabajadores = await EnlaceService.obtenerTrabajadoresMicroempresa(id);
      if (!responseTrabajadores || !responseTrabajadores.data) {
        console.warn("⚠️ No se pudieron obtener los trabajadores correctamente.");
        Alert.alert("Error", "No se pudieron cargar los trabajadores.");
        return;
      }
      const microempresaActualizada = {
        ...responseMicroempresa.data,
        trabajadores: responseTrabajadores.data,
      };
      console.log("📌 Microempresa actualizada:", microempresaActualizada);
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
      console.error("❌ Error al obtener la foto de perfil:", error.message);
    }
  };

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

  useEffect(() => {
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

  const handleDeleteImage = (publicId) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar esta imagen?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await MicroempresaService.eliminarImagen(id, publicId);
              Alert.alert("Éxito", "Imagen eliminada correctamente");
              setMicroempresa((prev) => ({
                ...prev,
                imagenes: prev.imagenes.filter((img) => img.public_id !== publicId),
              }));
            } catch (error) {
              console.error("Error al eliminar imagen:", error.message);
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
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🚨 Solicitando desvinculación del trabajador con enlace ID:", trabajador.enlaceId);
              await EnlaceService.desvincularTrabajador(trabajador.enlaceId);
              Alert.alert("Éxito", "Trabajador desvinculado correctamente");
              setMicroempresa((prev) => ({
                ...prev,
                trabajadores: prev.trabajadores.filter((t) => t.enlaceId !== trabajador.enlaceId),
              }));
            } catch (error) {
              console.error("Error al desvincular trabajador:", error.message);
              Alert.alert("Error", "No se pudo desvincular el trabajador.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([fetchMicroempresa(), fetchFotoPerfil(), fetchServicios()]).finally(() =>
        setLoading(false)
      );
    }, [id])
  );

  // Visor de imagen
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImageUrl(null);
    setImageModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Cargando datos de la microempresa...
        </Text>
      </View>
    );
  }
  

  if (!microempresa) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.error, { color: theme.text }]}>
          No se pudieron cargar los datos de la microempresa.
        </Text>
      </View>
    );
  }



  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={[]}
        keyExtractor={() => "flatlist_microempresa"}
        ListHeaderComponent={
          <View style={styles.container}>

            {/* Foto de perfil */}
            <View style={styles.imageContainer}>
              {fotoPerfilUrl ? (
                <Image
                  source={{ uri: `${fotoPerfilUrl}?time=${new Date().getTime()}` }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <Text style={[styles.placeholderText, { color: theme.text }]}>
                  Imagen no disponible
                </Text>
              )}
            </View>
  
            {/* Datos de la microempresa */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                {microempresa.nombre || "Sin nombre"}
              </Text>
              <Text style={[styles.description, { color: theme.text }]}>
                {microempresa.descripcion || "Sin descripción"}
              </Text>
              <View style={styles.infoContainer}>
                <Text style={[styles.infoText, { color: theme.text }]}>
                  📞 <Text style={[styles.infoLabel, { color: theme.text }]}>Teléfono:</Text> {microempresa.telefono || "Sin teléfono"}
                </Text>
                <Text style={[styles.infoText, { color: theme.text }]}>
                  📍 <Text style={[styles.infoLabel, { color: theme.text }]}>Dirección:</Text> {microempresa.direccion || "Sin dirección"}
                </Text>
                <Text style={[styles.infoText, { color: theme.text }]}>
                  ✉️ <Text style={[styles.infoLabel, { color: theme.text }]}>Correo:</Text> {microempresa.email || "Sin email"}
                </Text>
                <Text style={[styles.infoText, { color: theme.text }]}>
                  🏷️ <Text style={[styles.infoLabel, { color: theme.text }]}>Categoría:</Text> {microempresa.categoria || "Sin categoría"}
                </Text>
              </View>
              {user && user.isAdmin && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.blueButton]}
                  onPress={() =>
                    navigation.navigate("EditarMicroempresa", { id, userId: user?.id, modo: "editar" })
                  }
                >
                  <Text style={styles.buttonText}>Editar Microempresa</Text>
                </TouchableOpacity>
              </View>
            )}
            </View>
  
            {/* Servicios Ofrecidos */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Ofrecidos</Text>
              {servicios.length > 0 ? (
                servicios.map((servicio) => (
                  <TouchableOpacity 
                  key={servicio._id} 
                  style={[
                    styles.servicioItem,
                    { 
                      backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444",
                      borderColor: theme.background === "#FFFFFF" ? "#ddd" : "#444" 
                    }
                  ]}
                  onPress={() => navigation.navigate("DetalleServicio", { servicio })}
                  >
                    <Text style={[styles.servicioName, { color: theme.text }]}>{servicio.nombre}</Text>
                    <Text style={[styles.servicioDetail, { color: theme.text }]}>
                      Precio: ${servicio.precio}
                    </Text>
                    <Text style={[styles.servicioDetail, { color: theme.text }]}>
                      {servicio.descripcion}
                    </Text>
                    {montoAbono[servicio._id] && montoAbono[servicio._id] > 0 && (
                      <Text style={[styles.servicioAbono, { color: theme.text }]}>
                        Costo Reserva: ${montoAbono[servicio._id]}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.servicioDetail, { color: theme.text }]}>
                  No hay servicios registrados aún.
                </Text>
              )}
  
              {user && user.isAdmin && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.greenButton]}
                  onPress={() => navigation.navigate("Servicio", { id })}
                >
                  <Text style={styles.buttonText}>Configurar Servicios</Text>
                </TouchableOpacity>
              </View>
            )}
            </View>
  
            {/* Trabajadores */}
            {console.log("📌 Lista de trabajadores:", microempresa.trabajadores)}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Trabajadores</Text>
              {microempresa.trabajadores.length > 0 ? (
                <FlatList
                  data={microempresa.trabajadores}
                  keyExtractor={(item) => item.enlaceId || item._id}
                  numColumns={2}
                  renderItem={({ item }) => (
                    <View style={[styles.trabajadorCard, { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" }]}>
                      <TouchableOpacity
                        style={styles.trabajadorInfo}
                        onPress={() => navigation.navigate("TrabajadoresValoracionScreen", { trabajador: item })}
                      >
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.nombre || "Sin nombre"}</Text>
                        <Text style={[styles.cardDetail, { color: theme.text }]}>{item.telefono || "Sin teléfono"}</Text>
                      </TouchableOpacity>
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
                <Text style={[styles.noImagesText, { color: theme.text }]}>No hay trabajadores aún.</Text>
              )}
              <View style={styles.buttonContainer}>
                {/* Botón Invitar Trabajador */}
{microempresa.tipoPlan === "Plan Premium" && (
  <TouchableOpacity
    style={[styles.button, styles.greenButton, { flex: 1, marginRight: 5 }]} // Ajustar ancho
    onPress={() => navigation.navigate("InvitarTrabajador", { idMicroempresa: id })}
  >
    <Text style={styles.buttonText}>Invitar Trabajador</Text>
  </TouchableOpacity>
  )}
  {/* Botón Ver Invitaciones */}
{microempresa.tipoPlan === "Plan Premium" && (
  <TouchableOpacity
    style={[styles.button, styles.blueButton, { flex: 1, marginLeft: 5 }]} // Ajustar ancho
    onPress={() => navigation.navigate("Invitaciones", { idMicroempresa: id })}
  >
    <Text style={styles.buttonText}>Ver Invitaciones</Text>
  </TouchableOpacity>
  )}
</View>



            </View>
  
            {/* Galería */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Galería</Text>
              <View style={[styles.galleryContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#F2F2F2" : "#555" }]}>
                {microempresa.imagenes.length > 0 ? (
                  <FlatList
                    data={microempresa.imagenes}
                    horizontal
                    keyExtractor={(item) => item.public_id}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    renderItem={({ item }) => (
                      <View style={styles.galleryImageContainer}>
                        <TouchableOpacity onPress={() => openImageModal(item.url)}>
                          <Image
                            source={{ uri: item.url }}
                            style={styles.galleryImage}
                            contentFit="cover"
                          />
                        </TouchableOpacity>
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
                  <Text style={[styles.noImagesText, { color: theme.text }]}>
                    No hay imágenes disponibles
                  </Text>
                )}
              </View>
              {user && user.isAdmin && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.blueButton]}
                  onPress={() => navigation.navigate("SubirImagenes", { id })}
                >
                  <Text style={styles.buttonText}>Añadir Imágenes</Text>
                </TouchableOpacity>
              </View>
              )}
            </View>
          </View>
        }
        ListFooterComponent={<View style={{ height: 20 }} />}
        contentContainerStyle={styles.listContainer}
      />
      {/* Visor de imagen */}
      <ImageViewing
        images={selectedImageUrl ? [{ uri: selectedImageUrl }] : []}
        imageIndex={0}
        visible={imageModalVisible}
        onRequestClose={closeImageModal}
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
    flex: 1,
    padding: 5,
    paddingBottom: 20,
    paddingTop: 40,
  },
  toggleIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 10,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  sectionContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Inter",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: 14,
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
    flexDirection: "row", // Alinea los botones en fila
    justifyContent: "space-between", // Espacia los botones uniformemente
    alignItems: "center", // Asegura alineación vertical uniforme
    marginTop: 10,
    paddingHorizontal: 10,
  },
  
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blueButton: {
    backgroundColor: "#1e90ff",
  },
  greenButton: {
    backgroundColor: "#28a745",
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
    fontSize: 16,
  },
  deleteTrabajadorButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF3B30",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: "center",
    justifyContent: "center",
  },
  trabajadorCard: {
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
  trabajadorInfo: {
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardDetail: {
    fontSize: 12,
    textAlign: "center",
  },
  noImagesText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  servicioDetail: {
    fontSize: 14,
    fontFamily: "Inter",
    marginBottom: 3,
  },
  servicioAbono: {
    fontSize: 14,
    fontFamily: "Inter",
    fontWeight: "bold",
    marginTop: 5,
  },
  galleryContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  galleryImageContainer: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  
});
