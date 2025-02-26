import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registrarCliente } from '../services/user.service'; // ✅ Importación correcta

export default function RegistroClienteScreen() {
    const navigation = useNavigation();
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegistro = async () => {
        if (!nombre || !apellido || !email || !password || !telefono) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }

        try {
            setLoading(true);
            const nuevoCliente = { 
                nombre, 
                apellido, 
                email, 
                password, 
                telefono, 
                state: "activo" 
            };

            await registrarCliente(nuevoCliente); // ✅ Eliminamos `response` porque no se usa

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
        <View style={styles.container}>
            <Text style={styles.title}>Registro de Cliente</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Nombre" 
                value={nombre} 
                onChangeText={setNombre} 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Apellido" 
                value={apellido} 
                onChangeText={setApellido} 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none"
            />
            <TextInput 
                style={styles.input} 
                placeholder="Contraseña" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Teléfono" 
                value={telefono} 
                onChangeText={setTelefono} 
                keyboardType="phone-pad" 
            />
            <Button 
                title={loading ? "Registrando..." : "Registrarse"} 
                onPress={handleRegistro} 
                color="#007BFF" 
                disabled={loading} 
            />
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
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#FFF',
    },
});
