import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actions-sheet";
import MicroempresaService from "../services/microempresa.service.js";
import { useMicroempresa } from "../context/microempresa.context";
import { useAuth } from "../context/auth.context";
import { useTheme } from "../context/theme.context";
import { getSuscripcionByUserId } from "../services/suscripcion.service.js";
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
  "Consultoria",
];

const FormularioMicroempresaScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [phoneDigits, setPhoneDigits] = useState('');
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [categoria, setCategoria] = useState("");
  const [errors, setErrors] = useState({});

  const { fetchMicroempresa } = useMicroempresa();
  const { logout } = useAuth();

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

    // Validación del teléfono chileno: se ingresa solo la parte numérica (8 dígitos)
        if (!/^\d{8}$/.test(phoneDigits)) {
          Alert.alert("Error", "Debes ingresar 8 dígitos para tu número de teléfono");
          return;
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
      const responseSuscripcion = await getSuscripcionByUserId(userId);
      if (responseSuscripcion === "Error") {
        Alert.alert("Error", "No tienes Suscripcion.");
        console.error("Error al obtener la suscripción, No tienes suscripcion:", errorSuscripcion.message);
        return;
      } 
      const idSuscripcion = responseSuscripcion.id;
      console.log("ID de suscripción:", idSuscripcion);

      const nuevaMicroempresa = {
        nombre,
        descripcion,
        telefono: "+569" + phoneDigits, 
        direccion,
        email,
        categoria,
        idTrabajador: userId,
        idSuscripcion,
      };
      console.log(" Nueva microempresa:", nuevaMicroempresa);
      const response = await MicroempresaService.createMicroempresa(nuevaMicroempresa);
      console.log("📦 Respuesta del backend al crear microempresa:", response.data);

      // Actualizamos el contexto para reflejar la nueva microempresa
      await fetchMicroempresa();

      // Redirigimos al flujo normal de trabajador
      navigation.replace("HomeNavigator");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la microempresa.");
      console.error("❌ Error al crear la microempresa:", error.message);
    }
  };

  const handleCancel = async () => {
    // Se realiza logout y se redirige al Login
    await logout();
    navigation.replace("Login");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Crear Microempresa</Text>

      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#555",
            color: theme.text,
            borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777"
          }
        ]}
        placeholder="Nombre"
        placeholderTextColor={theme.text}
        value={nombre}
        onChangeText={setNombre}
      />
      {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#555",
            color: theme.text,
            borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777"
          }
        ]}
        placeholder="Descripción"
        placeholderTextColor={theme.text}
        value={descripcion}
        onChangeText={setDescripcion}
      />
      {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}

      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#555",
            color: theme.text,
            borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777"
          }
        ]}
        placeholder="Teléfono"
        placeholderTextColor={theme.text}
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#555",
            color: theme.text,
            borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777"
          }
        ]}
        placeholder="Dirección"
        placeholderTextColor={theme.text}
        value={direccion}
        onChangeText={setDireccion}
      />
      {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#555",
            color: theme.text,
            borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777"
          }
        ]}
        placeholder="Email"
        placeholderTextColor={theme.text}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Selector de categoría */}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          { backgroundColor: theme.background === "#FFFFFF" ? "#f9f9f9" : "#333" }
        ]}
        onPress={() => actionSheetRef.current?.show()}
      >
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

      {/* Botones de acción */}
      <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear Microempresa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 5,
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: "#007BFF",
  },
  cancelButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FormularioMicroempresaScreen;

