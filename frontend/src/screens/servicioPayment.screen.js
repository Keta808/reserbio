import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, Button, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { useNavigation, useRoute } from "@react-navigation/native";
import reservaService from "../services/reserva.service";
import paymentService from "../services/payment.services.js";

const ServicioPaymentScreen = () => {

    const route = useRoute();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const { urlPago, idServicio, reservaData } = route.params;
    const [browserOpen, setBrowserOpen] = useState(false);

    useEffect(() => {
        //  Abre Mercado Pago en el navegador externo
        abrirMercadoPago();
    }, []);


    const abrirMercadoPago = async () => {
        try {
            setBrowserOpen(true);
            await WebBrowser.openBrowserAsync(urlPago);
        } catch (error) {
            console.error("Error al abrir el navegador:", error);
            Alert.alert("Error", "No se pudo abrir Mercado Pago.");
            navigation.goBack();
        } finally {
            setBrowserOpen(false);
        }
    };

    const verificarPago = async () => {
        try {
            setLoading(true);
            const response = await paymentService.verificarUltimoPago(idServicio);

            if (response.state === "Success" && (response.data.state === "approved" || response.data.state === "Pending")) {
                //  Confirmar reserva si el pago está aprobado o pendiente
                const response = await reservaService.createReservaHorario(reservaData);
                console.log("Reserva creada:", response);
                 //  Actualizar el `idCliente` en el pago
            const actualizarPagoResponse = await paymentService.actualizarPago({
                idServicio,
                idCliente: reservaData.cliente,
            });
            if (actualizarPagoResponse.state === "Error") {
                console.log("Error al actualizar el idCliente en Payment.");
            }
            Alert.alert("Reserva exitosa", "Tu reserva ha sido confirmada.");
            navigation.navigate("HomeNavigator", { screen: "Reservas" });
            } else {
                Alert.alert("Pago no verificado", "No se encontró un pago aprobado.");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error al verificar pago:", error);
            Alert.alert("Error", "Ocurrió un error al verificar el pago.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            {loading && <ActivityIndicator size="large" color="#000" />}
            
            {!browserOpen && (
                <View>
                    <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 15 }}>
                        Por favor, regresa a la app después de completar el pago en Mercado Pago.
                    </Text>
                    <Button title="Verificar Pago" onPress={verificarPago} />
                    <Button title="Cancelar" onPress={() => navigation.goBack()} color="red" />
                </View>
            )}
        </View>
    );
};

export default ServicioPaymentScreen;