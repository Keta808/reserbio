import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet } from "react-native";
import MicroempresaService from "../services/microempresa.service";

const CATEGORIAS = ["Barberia", "Peluqueria", "Estetica", "Masajes", "Manicure", "Pedicure", "Depilacion", "Tatuajes", "Piercing", "Clases particulares", "Consultoria"];

export default function ListaMicroempresasScreen({ navigation }) {
  const [microempresas, setMicroempresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log("🔄 Cargando microempresas al iniciar...");
    cargarMicroempresas(); // Cargar todas las microempresas al inicio
  }, []);

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
      const data = await MicroempresaService.getMicroempresas();
      console.log("🔍 Datos recibidos del backend:", data);
  
      // Verifica si `data` tiene la estructura correcta
      if (data && data.state === "Success" && Array.isArray(data.data)) {
        setMicroempresas(data.data);
      } else {
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
    <View style={styles.container}>
      {/* Buscador */}
      <TextInput
        style={styles.input}
        placeholder="Buscar microempresa..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtro de Categoría */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar:</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>{categoriaSeleccionada || "Categoría"}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Selección de Categoría */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona una categoría</Text>
          {CATEGORIAS.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={styles.modalOption}
              onPress={() => {
                setCategoriaSeleccionada(categoria);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>{categoria}</Text>
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
            <Text style={styles.modalOptionText}>Mostrar todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Lista de Microempresas */}
      {loading ? (
        <Text>Cargando microempresas...</Text>
      ) : filtrarMicroempresas().length > 0 ? (
        <FlatList
          data={filtrarMicroempresas()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("MicroempresaCliente", { id: item._id })}
            >
              <Text style={styles.cardTitle}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>No hay microempresas disponibles.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
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
    marginRight: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  filterButtonText: {
    fontSize: 16,
    color: "#007BFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
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
  },
  modalCancel: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF4D4D",
    borderRadius: 5,
  },
  modalCancelText: {
    fontSize: 18,
    color: "white",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

