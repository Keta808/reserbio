import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import invitacionService from "../services/invitacion.service";

const AceptarInvitacionScreen = ({ route }) => {
    const navigation = useNavigation();
    const { token } = route.params || {};
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            Alert.alert("Error", "No se recibió ningún token válido.");
            navigation.goBack();
        }
    }, [token]);

    const handleAceptar = async () => {
        setLoading(true);
        try {
            const response = await invitacionService.aceptarInvitacion(token);
            Alert.alert("Éxito", response.message);
            navigation.navigate("HomeNavigator");
        } catch (error) {
            Alert.alert("Error", "No se pudo aceptar la invitación.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
                ¿Aceptar la invitación?
            </Text>

            <TouchableOpacity onPress={handleAceptar} disabled={loading} style={{ padding: 10, backgroundColor: "green", marginBottom: 10 }}>
                <Text style={{ color: "white" }}>{loading ? "Aceptando..." : "Aceptar"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, backgroundColor: "red" }}>
                <Text style={{ color: "white" }}>Rechazar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AceptarInvitacionScreen;

