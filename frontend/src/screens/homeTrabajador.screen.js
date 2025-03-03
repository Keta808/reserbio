import React, { useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/auth.context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/theme.context";
import { MicroempresaContext } from "../context/microempresa.context"; // Nuevo contexto
import { Ionicons } from "@expo/vector-icons";
export default function HomeTrabajadorScreen() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useContext(AuthContext);
    const { microempresa, fetchMicroempresa } = useContext(MicroempresaContext); // Nuevo contexto para la microempresa
    const navigation = useNavigation();

    useEffect(() => {
        if (user && !microempresa) {
            fetchMicroempresa(user.id);
        }
    }, [user, microempresa, fetchMicroempresa]);

    const handleGoToPerfilTrabajador = () => {
        if (!user) {
            Alert.alert("Error", "No hay información del trabajador disponible.");
            return;
        }
        navigation.navigate("Perfil");
    };

    const handleGoToPerfilMicroempresa = () => {
        if (!microempresa) {
            Alert.alert("Error", "No tienes una microempresa asociada.");
            return;
        }
        navigation.navigate("Microempresa", { id: microempresa._id, userId: user.id });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
              {/* Toggle de modo oscuro en la esquina superior derecha */}
              <TouchableOpacity style={styles.toggleIcon} onPress={toggleTheme}>
                <Ionicons
                    name={theme.background === "#FFFFFF" ? "moon" : "sunny"}
                    size={25}
                    color={theme.text}
                />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: theme.text }]}>¡Bienvenido Trabajador!</Text>

            {microempresa && (
                <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={handleGoToPerfilMicroempresa}>
                    <Text style={styles.buttonText}>Ver Microempresa</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.button, styles.lightBlueButton]} onPress={handleGoToPerfilTrabajador}>
                <Text style={styles.buttonText}>Ver Perfil</Text>
            </TouchableOpacity>

            

            <TouchableOpacity style={[styles.button, styles.redButton]} onPress={logout}>
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
        fontSize: 32, 
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#000000",
        textAlign: "center",
        marginBottom: 120, //  Más separación con los botones
        textShadowColor: "rgba(0, 0, 0, 0.4)", // Contorno suave
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    button: {
        width: "80%",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15, // Espaciado uniforme
        shadowColor: "#000000",
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
        textShadowColor: "rgba(0, 0, 0, 0.5)", // Contorno negro sutil
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    blueButton: {
        backgroundColor: "#1e90ff",
    },
    lightBlueButton: {
        backgroundColor: "#00bfff", //  Azul más claro para "Ver Perfil"
    },
    toggleThemeButton: {
        backgroundColor: "#FFCC00", //  Amarillo para cambio de tema
    },
    redButton: {
        backgroundColor: "#FF0000",
    },
    toggleIcon: {
        position: "absolute",
        top: 10, // 🔹 Ajustado para que no choque con la barra de estado
        right: 20, // 🔹 Bien en la esquina
        padding: 10,
        borderRadius: 20,
    },
});

