import React, { useState, useRef } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actions-sheet";
import MicroempresaService from "../services/microempresa.service.js";

const CATEGORIAS = ["Barberia", "Peluqueria", "Estetica", "Masajes", "Manicure", "Pedicure", "Depilacion", "Tatuajes", "Piercing", "Clases particulares", "Consultoria"];

const FormularioMicroempresaScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState("");
  const [errors, setErrors] = useState({});

  // 📌 Creamos una referencia para ActionSheet
  const actionSheetRef = useRef(null);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id;
      }
      console.error("No se encontraron datos de usuario en AsyncStorage");
      return null;
    } catch (error) {
      console.error("Error al obtener datos de AsyncStorage:", error);
      return null;
    }
  };

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

    if (!categoria) {
      newErrors.categoria = "Debe seleccionar una categoría.";
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

      const response = await MicroempresaService.createMicroempresa(nuevaMicroempresa);
      const id = response.data._id || response.data.id; // Soporta ambas opciones

      console.log("📦 Respuesta del backend al crear microempresa:", response.data);
      console.log("🚀 Navegando a SubirFotoPerfil con ID:", id);

      navigation.navigate("SubirFotoPerfil", { id, modo: "crear" });

    } catch (error) {
      Alert.alert("Error", "No se pudo crear la microempresa.");
      console.error("❌ Error al crear la microempresa:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Microempresa</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

      <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />
      {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}

      <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
      {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

      <TextInput style={styles.input} placeholder="Dirección" value={direccion} onChangeText={setDireccion} />
      {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* 📌 Selector de categoría con ActionSheet */}
      <TouchableOpacity style={styles.pickerButton} onPress={() => actionSheetRef.current?.show()}>
        <Text>{categoria || "Selecciona una categoría..."}</Text>
      </TouchableOpacity>
      {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}

      <ActionSheet ref={actionSheetRef}>
        {CATEGORIAS.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setCategoria(item);
              actionSheetRef.current?.hide();
            }}
          >
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ActionSheet>

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
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 5,
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    // marginBottom: 15,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});

export default FormularioMicroempresaScreen;
