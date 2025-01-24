import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MicroempresaService from '../services/microempresa.service.js';

const FormularioMicroempresaScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState("");
  const [errors, setErrors] = useState({});

  // Función para obtener el ID del trabajador autenticado
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id;
      } else {
        console.error('No se encontraron datos de usuario en AsyncStorage');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos de AsyncStorage:', error);
      return null;
    }
  };

  // Función para manejar el envío del formulario
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
      const userId = await getUserId();
      if (!userId) return;

      const nuevaMicroempresa = {
        nombre,
        descripcion,
        telefono,
        direccion,
        email,
        categoria,
        idTrabajador: userId,
      };

      // Usar el servicio para crear la microempresa
      const response = await MicroempresaService.createMicroempresa(nuevaMicroempresa);
      console.log("Datos enviados al backend:", nuevaMicroempresa);
      Alert.alert("Éxito", "La microempresa fue creada correctamente.");
      navigation.navigate("Microempresa", { id: response.data._id }); // Redirige al perfil de la microempresa creada
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la microempresa.");
      console.error("❌ Error al crear la microempresa:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Microempresa</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
      />
      {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}

      <Button title="Crear Microempresa" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});

export default FormularioMicroempresaScreen;