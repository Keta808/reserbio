import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { registrarCliente } from '../services/user.service';

export default function RegistroClienteScreen() {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Para el teléfono, se guardarán solo los 8 dígitos ingresados
  const [phoneDigits, setPhoneDigits] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    // Verificar que se hayan completado todos los campos
    if (!nombre || !apellido || !email || !password || !phoneDigits) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    
    // Validación del correo: debe contener "@" y terminar con una extensión válida.
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "El correo debe ser válido y terminar con una extensión (ej. .cl, .com)");
      return;
    }
    
    // Validación del teléfono chileno: se ingresa solo la parte numérica (8 dígitos)
    if (!/^\d{8}$/.test(phoneDigits)) {
      Alert.alert("Error", "Debes ingresar 8 dígitos para tu número de teléfono");
      return;
    }

    try {
      setLoading(true);
      const nuevoCliente = { 
        nombre, 
        apellido, 
        email, 
        password, 
        // Se arma el teléfono completo concatenando el prefijo fijo +569
        telefono: "+569" + phoneDigits, 
        state: "activo" 
      };

      await registrarCliente(nuevoCliente);

      Alert.alert("Registro exitoso", "Tu cuenta ha sido creada", [
        { text: "OK", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (error) {
      console.error("❌ Error al registrar cliente:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F4F4F4' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registro de Cliente</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#888"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor="#888"
            value={apellido}
            onChangeText={setApellido}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Campo de teléfono con prefijo fijo */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
          <Text style={styles.prefix}>+569</Text>
          <TextInput 
            style={[styles.input, { flex: 1 }]}
            placeholder="XXXXXXXX"
            placeholderTextColor="#888"
            value={phoneDigits}
            onChangeText={setPhoneDigits}
            keyboardType="number-pad"
            maxLength={8}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegistro} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registrando..." : "Registrarse"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  prefix: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
