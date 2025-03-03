import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, Button 
} from "react-native";
import { Image } from "expo-image"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actions-sheet";
import MicroempresaService from "../services/microempresa.service.js";
import { useAuth } from "../context/auth.context";
import { useTheme } from "../context/theme.context";

const CATEGORIAS = [
  "Barberia", "Peluqueria", "Estetica", "Masajes", "Manicure",
  "Pedicure", "Depilacion", "Tatuajes", "Piercing", "Clases particulares", "Consultoria"
];

const EditarMicroempresaScreen = ({ route, navigation }) => {
  const { id, userId = user?.id, modo } = route.params || {};
  const { user } = useAuth();
  const { theme } = useTheme();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [imagenes, setImagenes] = useState([]); // Nuevo estado para la galería
  const [errors, setErrors] = useState({});

  const actionSheetRef = useRef(null);

  useEffect(() => {
    if (!id) {
      console.error("⚠️ Error: No hay ID de microempresa.");
      Alert.alert("Error", "No se pudo cargar la microempresa.");
      return;
    }

    const fetchMicroempresa = async () => {
      try {
        console.log("📥 Obteniendo datos de la microempresa:", id);
        const { data } = await MicroempresaService.getMicroempresaData(id);

        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setTelefono(data.telefono);
        setDireccion(data.direccion);
        setEmail(data.email);
        setCategoria(data.categoria);
        setFotoPerfil(data.fotoPerfil?.url ?? null);
        setImagenes(data.imagenes || []); // Guardamos las imágenes actuales
        console.log("📸 Foto de perfil cargada en edición:", data.fotoPerfil?.url);
      } catch (error) {
        console.error("❌ Error al cargar datos de la microempresa:", error.message);
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
      const datosActualizados = { 
        nombre, 
        descripcion, 
        telefono, 
        direccion, 
        email, 
        categoria, 
        userId,
        fotoPerfil, // Se conserva la foto de perfil actual
        imagenes // Se conserva el array de imágenes (galería)
      };

      console.log("📦 Enviando datos actualizados al backend:", datosActualizados);
      await MicroempresaService.updateMicroempresa(id, datosActualizados);

      console.log("✅ Microempresa actualizada con éxito.");
      Alert.alert("Éxito", "Microempresa actualizada correctamente.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Microempresa", params: { id, userId } }],
      });
    } catch (error) {
      console.error("❌ Error al actualizar la microempresa:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo actualizar la microempresa.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Editar Microempresa</Text>

      <TouchableOpacity onPress={() => navigation.navigate("SubirFotoPerfil", { id, modo: "editar" })}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.image} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.background === "#FFFFFF" ? "#eee" : "#555" }]}>
            <Text style={{ color: theme.text }}>📷 Agregar Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput 
        style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
        value={nombre} 
        onChangeText={setNombre} 
        placeholder="Nombre"
        placeholderTextColor={theme.text}
      />
      {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

      <TextInput 
        style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
        value={descripcion} 
        onChangeText={setDescripcion} 
        placeholder="Descripción"
        placeholderTextColor={theme.text}
      />
      {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}

      <TextInput 
        style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
        value={telefono} 
        onChangeText={setTelefono} 
        placeholder="Teléfono" 
        keyboardType="phone-pad"
        placeholderTextColor={theme.text}
      />
      {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

      <TextInput 
        style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
        value={direccion} 
        onChangeText={setDireccion} 
        placeholder="Dirección"
        placeholderTextColor={theme.text}
      />
      {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

      <TextInput 
        style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
        value={email} 
        onChangeText={setEmail} 
        placeholder="Email" 
        keyboardType="email-address"
        placeholderTextColor={theme.text}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.background === "#FFFFFF" ? "#f9f9f9" : "#333" }]} onPress={() => actionSheetRef.current?.show()}>
        <Text style={{ color: theme.text }}>{categoria || "Selecciona una categoría..."}</Text>
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

      <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Actualizar Microempresa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#333",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
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
});

export default EditarMicroempresaScreen;





