import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/auth.context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/theme.context";
// import * as Linking from "expo-linking";

export default function HomeTrabajadorScreen() {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useContext(AuthContext);
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    };

    // Navegaciones
    const handleGoToPerfilTrabajador = () => navigation.navigate("Perfil");
    const handleGoToListaMicroempresas = () => navigation.navigate("ListaMicroempresas");
    ;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Bienvenido Trabajador</Text>

            <Button title="Ver Perfil" onPress={handleGoToPerfilTrabajador} color={theme.primary} />
            
            <Button title="Ver Lista de Microempresas" onPress={handleGoToListaMicroempresas} color={theme.primary} />

            {/* 🌗 Botón para cambiar el tema */}
            <Button
                title={theme.background === "#FFFFFF" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                onPress={toggleTheme}
                color={theme.secondary}
            />

            <Button title="Cerrar Sesión" onPress={handleLogout} color="red" />
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


