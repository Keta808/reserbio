import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import invitacionService from '../services/invitacion.service';

export default function AceptarInvitacionScreen({ route }) {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(route.params?.userId || null); // Intentamos obtenerlo de `route.params`
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Si `userId` es null, intentamos obtenerlo de `AsyncStorage`
        console.log("📌 AceptarInvitacionScreen renderizado")
        const fetchUserId = async () => {
            if (!userId) {
                try {
                    const storedUser = await AsyncStorage.getItem('user');
                    console.log("📌 Valor de storedUser en AsyncStorage:", storedUser);
                    
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);
                        setUserId(parsedUser.id); // Guardamos `userId`
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
    
            // **Depuración**: Verifica la estructura de `response`
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
        <View style={styles.container}>
            <Text style={styles.title}>Aceptar Invitación</Text>
            <Text style={styles.label}>Ingresa el código de invitación:</Text>
            <TextInput
                style={styles.input}
                placeholder="Código de invitación"
                keyboardType="numeric"
                value={codigo}
                onChangeText={setCodigo}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <Button title="Aceptar Invitación" onPress={handleAceptar} color="#007BFF" />
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
