import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import invitacionService from '../services/invitacion.service';
import { useTheme } from '../context/theme.context';

export default function InvitarTrabajadorScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { idMicroempresa } = route.params; // Se recibe el ID de la microempresa
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnviarInvitacion = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa un correo válido.");
      return;
    }

    try {
      setLoading(true);
      const response = await invitacionService.enviarInvitacion(email, idMicroempresa);
      const codigo = response?.data?.data?.codigoInvitacion;
      if (codigo) {
        console.log("Invitación enviada con éxito:", response);
        Alert.alert(
          "Invitación Enviada",
          `Se ha enviado una invitación a ${email} con el código: ${codigo}`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error("No se generó un código de invitación en la respuesta.");
      }
    } catch (error) {
      console.error("Error al enviar la invitación:", error.message);
      Alert.alert("Error", "No se pudo enviar la invitación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Invitar Trabajador</Text>
      <Text style={[styles.label, { color: theme.text }]}>Correo del trabajador:</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            color: theme.text, 
            backgroundColor: theme.background === "#FFFFFF" ? "#FFF" : "#555",
            borderColor: theme.background === "#FFFFFF" ? "#CCC" : "#777"
          }
        ]}
        placeholder="ejemplo@correo.com"
        placeholderTextColor={theme.text}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleEnviarInvitacion}>
          <Text style={styles.buttonText}>Enviar Invitación</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: 'bold',
  },
});
