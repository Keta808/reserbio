import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/auth.context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeClienteScreen() {
    const { logout } = useContext(AuthContext); 
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    };

    const handleGoToListaMicroempresas = () => {
        navigation.navigate('ListaMicroempresas');
    };

    const handleGoToAceptarInvitacion = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
    
            if (!user) {
                Alert.alert("Error", "No se encontró información del usuario.");
                return;
            }
    
            const parsedUser = JSON.parse(user);
            if (!parsedUser?.id) {
                Alert.alert("Error", "No se pudo obtener el ID del usuario.");
                return;
            }
    
            navigation.navigate("AceptarInvitacion", { userId: user.id });
        } catch (error) {
            console.error("❌ Error al obtener el ID del usuario:", error);
            Alert.alert("Error", "Ocurrió un problema al obtener los datos del usuario.");
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Bienvenido Cliente!</Text>
            
            <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={handleGoToListaMicroempresas}>
                <Text style={styles.buttonText}>Ver Lista de Microempresas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={handleGoToAceptarInvitacion}>
                <Text style={styles.buttonText}>Aceptar Invitación</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.redButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F9F9F9",
        padding: 20,
    },
    title: {
        fontSize: 32, //  Más grande para destacar
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#000000", //  Color oscuro para contraste
        textAlign: "center",
        
        
        marginBottom: 120, //  Más separación con los botones
        textShadowColor: "rgba(0, 0, 0, 0.4)", // Contorno suave
        textShadowOffset: { width: 2, height: 2 }, //  Sombra ligera
        textShadowRadius: 5, //  Difuminado para un efecto más moderno
    },
    button: {
        width: "80%",
        paddingVertical: 15,
        borderRadius: 12, 
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15, 
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, 
        shadowRadius: 5,
        elevation: 6, //  Sombras en Android
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#FFF", 
        
        textShadowColor: "rgba(0, 0, 0, 0.5)", // Contorno negro sutil
        textShadowOffset: { width: 1, height: 1 }, // Ligero desplazamiento
        textShadowRadius: 2, //  Difuminado suave
    },
    greenButton: {
        backgroundColor: "#28A745",
    },
    blueButton: {
        backgroundColor: "#007BFF",
    },
    redButton: {
        backgroundColor: "#FF0000",
    },
});



