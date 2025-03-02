import React, { useEffect, useState } from "react";
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
  StatusBar,
  Modal
} from "react-native";
import { Image } from "expo-image";
import Icon from "react-native-vector-icons/FontAwesome";
import ImageViewing from "react-native-image-viewing";
import MicroempresaService from "../services/microempresa.service";
import ServiciosService from "../services/servicio.service";
import { useFocusEffect } from "@react-navigation/native";

export default function MicroempresaClienteScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [microempresa, setMicroempresa] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [montoAbono, setMontoAbono] = useState({});

  // Estado para el modal de detalles del servicio
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  // Estado para el visor de imagen (ImageViewing)
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const fetchMicroempresa = async () => {
    try {
      if (!id) {
        Alert.alert("Error", "No se proporcionó el ID de la microempresa.");
        setLoading(false);
        return;
      }
      const response = await MicroempresaService.getMicroempresaData(id);
      if (response) {
        setMicroempresa(response.data);
      } else {
        Alert.alert("Error", "No se pudieron cargar los datos de la microempresa.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos de la microempresa.");
    }
  };

  const fetchFotoPerfil = async () => {
    try {
      const fotoPerfil = await MicroempresaService.getMicroempresaFotoPerfil(id);
      setFotoPerfilUrl(fotoPerfil);
    } catch (error) {
      console.error("Error al obtener la foto de perfil:", error);
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
      for (let servicio of servicios) {
        if (servicio.porcentajeAbono && servicio.porcentajeAbono > 0) {
          try {
            const monto = await ServiciosService.calcularMontoAbono(
              servicio._id,
              servicio.precio,
              servicio.porcentajeAbono
            );
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

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      Promise.all([fetchMicroempresa(), fetchFotoPerfil(), fetchServicios()]).finally(() =>
        setLoading(false)
      );
    }, [id])
  );

  // Abre el modal con detalles del servicio
  const openServiceModal = (service) => {
    setSelectedService(service);
    setServiceModalVisible(true);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
    setServiceModalVisible(false);
  };

  // Abre el visor de imagen usando react-native-image-viewing
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
        data={[]}
        keyExtractor={() => "flatlist_microempresa_cliente"}
        ListHeaderComponent={
          <View style={styles.container}>
            {/* Foto de perfil */}
            <View style={styles.imageContainer}>
              {fotoPerfilUrl ? (
                <TouchableOpacity
                  onPress={() =>
                    openImageModal(`${fotoPerfilUrl}?time=${new Date().getTime()}`)
                  }
                >
                  <Image
                    source={{ uri: `${fotoPerfilUrl}?time=${new Date().getTime()}` }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : (
                <Text style={styles.placeholderText}>Imagen no disponible</Text>
              )}
            </View>

            {/* Datos de la microempresa */}
            <View style={styles.sectionContainer}>
              <Text style={styles.title}>{microempresa.nombre || "Sin nombre"}</Text>
              <Text style={styles.description}>
                {microempresa.descripcion || "Sin descripción"}
              </Text>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  📞 <Text style={styles.infoLabel}>Teléfono:</Text>{" "}
                  {microempresa.telefono || "Sin teléfono"}
                </Text>
                <Text style={styles.infoText}>
                  📍 <Text style={styles.infoLabel}>Dirección:</Text>{" "}
                  {microempresa.direccion || "Sin dirección"}
                </Text>
                <Text style={styles.infoText}>
                  ✉️ <Text style={styles.infoLabel}>Correo:</Text>{" "}
                  {microempresa.email || "Sin email"}
                </Text>
                <Text style={styles.infoText}>
                  🏷️ <Text style={styles.infoLabel}>Categoría:</Text>{" "}
                  {microempresa.categoria || "Sin categoría"}
                </Text>
              </View>
            </View>

            {/* Servicios Ofrecidos */}
            {servicios.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Servicios Ofrecidos</Text>
                {servicios.map((servicio) => (
                  <View key={servicio._id} style={styles.servicioItem}>
                    <View style={styles.servicioInfo}>
                      <Text style={styles.servicioName}>{servicio.nombre}</Text>
                      <Text style={styles.servicioPrice}>
                        ${Number(servicio.precio || 0).toLocaleString("es-ES")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={() => openServiceModal(servicio)}
                    >
                      <Icon name="info-circle" size={24} color="#007BFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* Trabajadores */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Trabajadores</Text>
              {microempresa.trabajadores.length > 0 ? (
                <FlatList
                  data={microempresa.trabajadores}
                  key={"flatlist_trabajadores_cliente"}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() =>
                        navigation.navigate("Trabajador", { trabajador: item })
                      }
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
            </View>

            {/* Galería */}
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
                      <TouchableOpacity onPress={() => openImageModal(item.url)}>
                        <View style={styles.galleryImageContainer}>
                          <Image
                            source={{ uri: item.url }}
                            style={styles.galleryImage}
                            contentFit="cover"
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={styles.noImagesText}>No hay imágenes disponibles</Text>
                )}
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
             
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#007BFF" }]}
                onPress={() => navigation.navigate("HomeNavigator")}
              >
                <Text style={styles.actionButtonText}>Volver al Inicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
                onPress={() =>
                  navigation.navigate("SeleccionServicio", {
                    microempresaId: id,
                    trabajadores: microempresa.trabajadores,
                  })
                }
              >
                <Text style={styles.actionButtonText}>Reservar</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal para detalles del servicio */}
      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeServiceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedService.nombre || ""}
                </Text>
                <Text style={styles.modalText}>
                  Precio: $
                  {Number(selectedService.precio || 0).toLocaleString("es-ES")}
                </Text>
                <Text style={styles.modalText}>
                  Duración: {selectedService.duracion || "No especificada"}
                </Text>
                <Text style={styles.modalText}>
                  Descripción:{" "}
                  {selectedService.descripcion || "Sin descripción"}
                </Text>
                {selectedService.porcentajeAbono ? (
                  <Text style={styles.modalText}>
                    Abono: {selectedService.porcentajeAbono}%
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeServiceModal}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Visor de imagen usando react-native-image-viewing */}
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
    backgroundColor: "#F8F9FA",
  },
  container: {
    padding: 10,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  sectionContainer: {
    marginBottom: 20,
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
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#343A40",
  },
  description: {
    fontSize: 16,
    color: "gray",
    marginBottom: 15,
    textAlign: "center",
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  servicioItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  servicioInfo: {
    flexDirection: "column",
  },
  servicioName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#343A40",
  },
  servicioPrice: {
    fontSize: 14,
    color: "#007BFF",
  },
  infoButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    color: "#343A40",
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
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#343A40",
  },
  cardDetail: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  galleryContainer: {
    marginBottom: 15,
  },
  galleryImageContainer: {
    marginRight: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  noImagesText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 25,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#343A40",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007BFF",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  enlargedImage: {
    width: "90%",
    height: "70%",
  },
});
