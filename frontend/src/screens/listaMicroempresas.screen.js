import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView
} from "react-native";
import { Image } from "expo-image";
import MicroempresaService from "../services/microempresa.service";
import { useTheme } from "../context/theme.context";

const CATEGORIAS = [
  "Barberia",
  "Peluqueria",
  "Estetica",
  "Masajes",
  "Manicure",
  "Pedicure",
  "Depilacion",
  "Tatuajes",
  "Piercing",
  "Clases particulares",
  "Consultoria"
];

export default function ListaMicroempresasScreen({ navigation }) {
  const { theme } = useTheme();
  const [microempresas, setMicroempresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 3;
  const [hasMore, setHasMore] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    console.log(`📌 Ejecutando useEffect - Página actual: ${paginaActual}`);
    cargarMicroempresas();
  }, [paginaActual]);
  
  useEffect(() => {
    if (categoriaSeleccionada) {
      cargarMicroempresasPorCategoria();
    } else {
      cargarMicroempresas();
    }
  }, [categoriaSeleccionada]);
  
  const cargarMicroempresas = async () => {
    try {
      setLoading(true);
      console.log(`📌 Cargando microempresas - Página actual: ${paginaActual}`);
  
      const data = await MicroempresaService.getMicroempresas(paginaActual, limit);
  
      console.log("📌 Respuesta del backend:", data);
  
      if (data?.state === "Success" && Array.isArray(data.data.microempresas)) {
        const microempresasConImagen = await Promise.all(
          data.data.microempresas.map(async (micro) => {
            const fotoPerfil = await MicroempresaService.getMicroempresaFotoPerfil(micro._id);
            return { ...micro, fotoPerfil };
          })
        );
  
        setMicroempresas(microempresasConImagen);
  
        // Ahora usamos totalMicroempresas y totalPages
        const totalMicroempresas = data.data.totalMicroempresas;
        const totalPaginasBackend = data.data.totalPages;
  
        console.log(`📌 Total de microempresas: ${totalMicroempresas}, Total de páginas: ${totalPaginasBackend}`);
  
        if (typeof totalPaginasBackend === "number" && totalPaginasBackend > 0) {
          setTotalPaginas(totalPaginasBackend);
        } else {
          console.warn("⚠️ Error: 'totalPages' no es un número válido.");
          setTotalPaginas(1);
        }
      } else {
        console.warn("⚠️ No se encontraron microempresas o la respuesta no es válida.");
        setMicroempresas([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar microempresas:", error);
      setMicroempresas([]);
    } finally {
      setLoading(false);
    }
  };  

  const cargarMicroempresasPorCategoria = async () => {
    try {
      setLoading(true);
      const data = await MicroempresaService.getMicroempresasPorCategoria(categoriaSeleccionada);
      setMicroempresas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al cargar microempresas por categoría:", error);
      setMicroempresas([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarMicroempresas = () => {
    return microempresas.filter((microempresa) =>
      microempresa.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
  
        {/* Buscador */}
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          placeholder="Buscar microempresa..."
          placeholderTextColor={theme.text}
          value={busqueda}
          onChangeText={setBusqueda}
        />
  
        {/* Filtro de Categoría */}
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: theme.text }]}>Filtrar:</Text>
          <TouchableOpacity
            style={[styles.filterButton, { borderColor: theme.text }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.filterButtonText, { color: theme.text }]}>
              {categoriaSeleccionada || "Categoría"}
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Modal de Selección de Categoría */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona una categoría</Text>
            {CATEGORIAS.map((categoria) => (
              <TouchableOpacity
                key={categoria}
                style={styles.modalOption}
                onPress={() => {
                  setCategoriaSeleccionada(categoria);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: theme.text }]}>{categoria}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setCategoriaSeleccionada(null);
                setModalVisible(false);
                cargarMicroempresas();
              }}
            >
              <Text style={[styles.modalOptionText, { color: theme.text }]}>Mostrar todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
  
        {/* Lista de Microempresas */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={{ color: theme.text }}>Cargando microempresas...</Text>
          </View>
        ) : filtrarMicroempresas().length > 0 ? (
          <>
            <FlatList
              data={filtrarMicroempresas()}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.card,
                    { backgroundColor: theme.background === "#FFFFFF" ? "#f9f9f9" : "#444" }
                  ]}
                  onPress={() => navigation.navigate("MicroempresaCliente", { id: item._id })}
                >
                  <Image
                    source={{ uri: item.fotoPerfil }}
                    style={styles.image}
                  />
                  <View style={styles.infoContainer}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.nombre}</Text>
                    <Text style={[styles.cardDetail, { color: theme.text }]}>{item.direccion}</Text>
                    <Text style={[styles.cardDetail, { color: theme.text }]}>{item.telefono}</Text>
                    <Text style={[styles.cardDetail, { color: theme.text }]}>{item.categoria}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
  
  <View style={styles.paginationContainer}>
  <TouchableOpacity
    style={styles.paginationButton}
    onPress={() => {
      if (paginaActual > 1) {
        setPaginaActual((prev) => prev - 1);
      }
    }}
    disabled={paginaActual === 1} // Desactiva si está en la primera página
  >
    <Text style={styles.paginationButtonText}>Anterior</Text>
  </TouchableOpacity>

  <Text style={styles.paginationText}>
    Página {paginaActual} de {totalPaginas}
  </Text>

  <TouchableOpacity
    style={styles.paginationButton}
    onPress={() => {
      if (paginaActual < totalPaginas) {
        setPaginaActual((prev) => prev + 1);
      }
    }}
    disabled={paginaActual === totalPaginas} // Desactiva si está en la última página
  >
    <Text style={styles.paginationButtonText}>Siguiente</Text>
  </TouchableOpacity>
</View>

          </>
        ) : (
          <Text style={{ color: theme.text }}>No hay microempresas disponibles.</Text>
        )}
      </View>
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
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
    marginRight: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "80%",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 18,
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalCancel: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF4D4D",
    borderRadius: 5,
  },
  modalCancelText: {
    fontSize: 18,
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardDetail: {
    fontSize: 14,
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  paginationContainer: {
    flexDirection: "row", // Alinea elementos en fila
    justifyContent: "space-between", // Distribuye los elementos a los extremos
    alignItems: "center", // Alinea verticalmente
    paddingVertical: 10, // Espaciado arriba y abajo
    paddingHorizontal: 20, // Espaciado a los lados
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#007bff", // Color azul
    borderRadius: 5,
  },
  paginationButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  paginationText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

