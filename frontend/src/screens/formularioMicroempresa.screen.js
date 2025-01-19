// Importación de servicios correctamente
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
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
      />
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
});

export default FormularioMicroempresaScreen;

