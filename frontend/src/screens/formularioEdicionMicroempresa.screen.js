import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal, FlatList } from "react-native";
import MicroempresaService from "../services/microempresa.service.js";

const CATEGORIAS = ["Barberia", "Peluqueria", "Estetica", "Masajes", "Manicure", "Pedicure", "Depilacion", "Tatuajes", "Piercing", "Clases particulares", "Consultoria"];

const EditarMicroempresaScreen = ({ route, navigation }) => {
  const { id, userId } = route.params || {}; 
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMicroempresa = async () => {
      try {
        const { data } = await MicroempresaService.getMicroempresaData(id);
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setTelefono(data.telefono);
        setDireccion(data.direccion);
        setEmail(data.email);
        setCategoria(data.categoria);
      } catch (error) {
        console.error("Error al cargar datos de la microempresa:", error);
        Alert.alert("Error", "No se pudieron cargar los datos.");
      }
    };
    fetchMicroempresa();
  }, [id]);  

  const handleSubmit = async () => {
    let valid = true;
    const newErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
      valid = false;
    } else if (nombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres.";
      valid = false;
    }

    if (!descripcion.trim() || descripcion.length < 10) {
      newErrors.descripcion = "La descripción debe tener al menos 10 caracteres.";
      valid = false;
    }

    if (!telefono.trim() || !/^\d{9}$/.test(telefono)) {
      newErrors.telefono = "El teléfono debe tener 9 dígitos.";
      valid = false;
    }

    if (!direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria.";
      valid = false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+$/.test(email)) {
      newErrors.email = "El email no tiene un formato válido.";
      valid = false;
    }

    if (!categoria) {
      newErrors.categoria = "Debe seleccionar una categoría.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    try {
      const datosActualizados = { 
        nombre, 
        descripcion, 
        telefono, 
        direccion, 
        email, 
        categoria, 
        userId
      };
  
      console.log("📦 Enviando datos actualizados al backend:", datosActualizados);
  
      await MicroempresaService.updateMicroempresa(id, datosActualizados);
  
      const microempresaActualizada = await MicroempresaService.getMicroempresaData(id);
      console.log("📋 Microempresa actualizada en el frontend:", microempresaActualizada);
  
      Alert.alert("Éxito", "Microempresa actualizada correctamente.");
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'Microempresa', params: { userId, id } }],
      });
    } catch (error) {
      console.error("Error al actualizar la microempresa:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo actualizar la microempresa.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Microempresa</Text>
      
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
      {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}
      
      <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" />
      {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}
      
      <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" />
      {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}
      
      <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} placeholder="Dirección" />
      {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}
      
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      
      <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectButtonText}>{categoria || "Selecciona una categoría"}</Text>
      </TouchableOpacity>
      {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}

      <Button title="Actualizar Microempresa" onPress={handleSubmit} />

      {/* Modal para seleccionar la categoría */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona una categoría</Text>
          <FlatList
            data={CATEGORIAS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setCategoria(item);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 15 },
  error: { color: "red", fontSize: 12, marginBottom: 10 },
  selectButton: { 
    borderWidth: 1, 
    borderColor: "#007BFF", 
    borderRadius: 5, 
    padding: 10, 
    alignItems: "center", 
    marginBottom: 15 
  },
  selectButtonText: { fontSize: 16, color: "#007BFF" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  modalOption: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc", width: "80%", alignItems: "center" },
  modalOptionText: { fontSize: 18 },
  modalCancel: { marginTop: 20, padding: 10, backgroundColor: "#FF4D4D", borderRadius: 5 },
  modalCancelText: { fontSize: 18, color: "white" },
});

export default EditarMicroempresaScreen;
