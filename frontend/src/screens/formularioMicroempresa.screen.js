import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actions-sheet";
import MicroempresaService from "../services/microempresa.service.js";
import { useMicroempresa } from "../context/microempresa.context";
import { useAuth } from "../context/auth.context";
import { useTheme } from "../context/theme.context";
import { getSuscripcionByUserId } from "../services/suscripcion.service.js";
import { Ionicons } from "@expo/vector-icons";

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

  // Refs para los TextInput (usados para enfocar al tocar el contenedor)
  const nombreInputRef = useRef(null);
  const descripcionInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const direccionInputRef = useRef(null);
  const emailInputRef = useRef(null);

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
      console.log("Respuesta de suscripción:", responseSuscripcion);
      if (responseSuscripcion === "Error") {
        Alert.alert("Error", "No tienes Suscripcion.");
        console.error("Error al obtener la suscripción, No tienes suscripcion:", errorSuscripcion.message);
        return;
      } 
      const idSuscripcion = responseSuscripcion.data._id;
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
    await logout();
    navigation.replace("Login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Crear Microempresa</Text>

        {/* Campo Nombre */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => nombreInputRef.current?.focus()}
        >
          <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="business-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              ref={nombreInputRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Nombre"
              placeholderTextColor={theme.text}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>
        </TouchableOpacity>
        {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

        {/* Campo Descripción */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => descripcionInputRef.current?.focus()}
        >
          <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              ref={descripcionInputRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Descripción"
              placeholderTextColor={theme.text}
              value={descripcion}
              onChangeText={setDescripcion}
            />
          </View>
        </TouchableOpacity>
        {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}

        {/* Campo Teléfono */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => phoneInputRef.current?.focus()}
        >
          <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
            <Text style={[styles.prefix, { backgroundColor: theme.background, color: theme.text }]}>
              +569
            </Text>
            <TextInput
              ref={phoneInputRef}
              style={[styles.input, { flex: 1, color: theme.text }]}
              placeholder="XXXXXXXX"
              placeholderTextColor={theme.text}
              value={phoneDigits}
              onChangeText={setPhoneDigits}
              keyboardType="phone-pad"
              maxLength={8}
            />
          </View>
        </TouchableOpacity>
        {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

        {/* Campo Dirección */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => direccionInputRef.current?.focus()}
        >
          <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              ref={direccionInputRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Dirección"
              placeholderTextColor={theme.text}
              value={direccion}
              onChangeText={setDireccion}
            />
          </View>
        </TouchableOpacity>
        {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

        {/* Campo Email */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => emailInputRef.current?.focus()}
        >
          <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              ref={emailInputRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.text}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </TouchableOpacity>
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        {/* Selector de Categoría */}
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: theme.background === "#FFFFFF" ? "#f9f9f9" : "#333" }]}
          onPress={() => actionSheetRef.current?.show()}
        >
          <Text style={{ color: theme.text }}>
            {categoria || "Selecciona una categoría..."}
          </Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  prefix: {
    fontSize: 16,
    marginRight: 5,
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: "center",
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
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
