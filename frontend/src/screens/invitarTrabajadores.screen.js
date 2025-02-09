import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import invitacionService from '../services/invitacion.service';

export default function InvitarTrabajadorScreen({ navigation, route }) {
    const { idMicroempresa } = route.params; // Se recibe el ID de la microempresa desde la navegación
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
          console.log("📡 Invitación enviada con éxito:", response);
          Alert.alert("Éxito", "La invitación fue enviada correctamente.", [
            { text: "OK", onPress: () => navigation.goBack() }
          ]);
        } catch (error) {
          console.error("❌ Error al enviar la invitación:", error.message);
          Alert.alert("Error", "No se pudo enviar la invitación.");
        } finally {
          setLoading(false);
        }
      };
      

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Invitar Trabajador</Text>
            <Text style={styles.label}>Correo del trabajador:</Text>
            <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <Button title="Enviar Invitación" onPress={handleEnviarInvitacion} color="#007BFF" />
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
        backgroundColor: '#F4F4F4',
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
        backgroundColor: '#FFF',
    },
});
