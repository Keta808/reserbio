import React, { useContext, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/auth.context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/theme.context";
import { MicroempresaContext } from "../context/microempresa.context"; // Nuevo contexto

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
            <Text style={[styles.title, { color: theme.text }]}>Bienvenido Trabajador</Text>
            <Button title="Ver Perfil" onPress={handleGoToPerfilTrabajador} color={theme.primary} />
            {microempresa && (
                <Button title="Ver Microempresa" onPress={handleGoToPerfilMicroempresa} color={theme.primary} />
            )}
            {/* 🌗 Botón para cambiar el tema */}
            <Button
                title={theme.background === "#FFFFFF" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                onPress={toggleTheme}
                color={theme.secondary}
            />
            <Button title="Cerrar Sesión" onPress={logout} color="red" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
});

