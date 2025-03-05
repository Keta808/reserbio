import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import invitacionService from '../services/invitacion.service';
import { useTheme } from '../context/theme.context';

export default function AceptarInvitacionScreen({ route }) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [userId, setUserId] = useState(route.params?.userId || null);
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("📌 AceptarInvitacionScreen renderizado");
    const fetchUserId = async () => {
      if (!userId) {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          console.log("📌 Valor de storedUser en AsyncStorage:", storedUser);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserId(parsedUser.id);
            console.log("📌 userId obtenido y actualizado:", parsedUser.id);
          }
        } catch (error) {
          console.error("❌ Error al obtener el ID del usuario:", error.message);
        }
      }
    };        
    fetchUserId();
  }, []);

  const handleAceptar = async () => {
    if (!codigo.trim()) {
      Alert.alert("Error", "Por favor ingresa un código válido.");
      return;
    }
  
    try {
      setLoading(true);
      console.log("📤 Enviando código de invitación:", codigo, "con userId:", userId);
      const response = await invitacionService.aceptarInvitacion(codigo, userId);
      console.log("✅ Respuesta del backend:", response);
      const mensaje = typeof response.message === "string" ? response.message : JSON.stringify(response.message);
      Alert.alert("Éxito", mensaje, [
        { text: "OK", onPress: () => navigation.navigate("HomeNavigator") }
      ]);
    } catch (error) {
      console.error("❌ Error al aceptar la invitación:", error.response?.data || error.message);
      const mensajeError = error.response?.data?.message 
        ? error.response.data.message 
        : "No se pudo aceptar la invitación.";
      Alert.alert("Error", mensajeError);
    } finally {
      setLoading(false);
    }
  };    

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Aceptar Invitación</Text>
      <Text style={[styles.label, { color: theme.text }]}>Ingresa el código de invitación:</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#555",
            color: theme.text,
            borderColor: theme.background === "#FFFFFF" ? "#CCC" : "#777"
          }
        ]}
        placeholder="Código de invitación"
        placeholderTextColor={theme.text}
        keyboardType="numeric"
        value={codigo}
        onChangeText={setCodigo}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: "#007BFF" }]} onPress={handleAceptar}>
          <Text style={styles.buttonText}>Aceptar Invitación</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F4F4', // Este valor se sobreescribe con theme.background
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#FFF', // Se sobreescribe según el tema
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold',
  },
});

