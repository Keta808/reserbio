import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import MicroempresaService from "../services/microempresa.service.js";

const EditarMicroempresaScreen = ({ route, navigation }) => {
  const { id, userId } = route.params || {}; // Recibe el ID de la microempresa y el ID del usuario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState("");

  // Cargar datos de la microempresa
  useEffect(() => {
    const fetchMicroempresa = async () => {
      try {
        const { data } = await MicroempresaService.getMicroempresaData(id); // Accede directamente a `data`
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

  const [errors, setErrors] = useState({});

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    // Validaciones de campos
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

  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "El email no tiene un formato válido.";
    valid = false;
  }

  if (!categoria.trim()) {
    newErrors.categoria = "La categoría es obligatoria.";
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
        userId // Agregar userId al payload
      };
  
      console.log("📦 Enviando datos actualizados al backend:", datosActualizados);
  
      await MicroempresaService.updateMicroempresa(id, datosActualizados);
  
      // Volver a obtener los datos actualizados de la microempresa
      const microempresaActualizada = await MicroempresaService.getMicroempresaData(id);
      console.log("📋 Microempresa actualizada en el frontend:", microempresaActualizada);
  
      Alert.alert("Éxito", "Microempresa actualizada correctamente.");
  
      // Navegar de regreso y pasar los datos actualizados
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Microempresa',
            params: { 
              userId, 
              id, // ID de la microempresa
              // data: microempresaActualizada.data // Datos actualizados
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error al actualizar la microempresa:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo actualizar la microempresa.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Microempresa</Text>
      <TextInput 
        style={styles.input} 
        value={nombre} 
        onChangeText={setNombre} 
        placeholder="Nombre" 
      />
      {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}
      
      <TextInput 
        style={styles.input} 
        value={descripcion} 
        onChangeText={setDescripcion} 
        placeholder="Descripción" 
      />
      {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}
      
      <TextInput 
        style={styles.input} 
        value={telefono} 
        onChangeText={setTelefono} 
        placeholder="Teléfono" 
        keyboardType="phone-pad" 
      />
      {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}
      
      <TextInput 
        style={styles.input} 
        value={direccion} 
        onChangeText={setDireccion} 
        placeholder="Dirección" 
      />
      {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}
      
      <TextInput 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
        placeholder="Email" 
        keyboardType="email-address" 
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      
      <TextInput 
        style={styles.input} 
        value={categoria} 
        onChangeText={setCategoria} 
        placeholder="Categoría" 
      />
      {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}
      
      <Button title="Actualizar Microempresa" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 15 },
  error: { color: "red", fontSize: 12, marginBottom: 10 },
});

export default EditarMicroempresaScreen;
