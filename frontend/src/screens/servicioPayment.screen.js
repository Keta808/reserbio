import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, TouchableOpacity, Text, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { useNavigation, useRoute } from "@react-navigation/native";
import reservaService from "../services/reserva.service";
import paymentService from "../services/payment.services.js";
import { useTheme } from '../context/theme.context';
const ServicioPaymentScreen = () => {

    const route = useRoute();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const { urlPago, idServicio, reservaData } = route.params;
    const [browserOpen, setBrowserOpen] = useState(false);
    const { theme } = useTheme();

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

    const actualizarPago = async () => { 
        try {
            return await paymentService.actualizarPago({
                idServicio,
                idCliente: reservaData.cliente,
            });
        } catch (error) {
            console.error("Error al actualizar el idCliente en Payment:", error);
            return { state: "Error" };
        }

    };

    const verificarPago = async () => {
        try {
            setLoading(true);
            const response = await paymentService.verificarUltimoPago(idServicio);

            if (response.state === "Success" && ["approved", "pending", "authorized"].includes(response.data.state)) {
                //  Confirmar reserva si el pago está aprobado o pendiente
                const reservaResponse = await reservaService.createReservaHorario(reservaData);
                console.log("Reserva creada:", reservaResponse);
                 //  Actualizar el `idCliente` en el pago
                 const actualizarPagoResponse = await actualizarPago();
                 if (actualizarPagoResponse.state === "Error") {
                     console.log("Error al actualizar el idCliente en Payment.");
                 }
            Alert.alert("Reserva exitosa", "Tu reserva ha sido confirmada. Ve a la agenda de Tus Reservas para ver los detalles.");
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {loading && <ActivityIndicator size="large" color="#000" />}
            
            {!browserOpen && (
               <View style={styles.contenedorBotones}>
                    <Text style={[styles.texto, { color: theme.text }]}>
                    Presiona "Verificar Pago" para completar la reserva. Si el pago no se realizó, la cita no se reservará. Si deseas cancelar sin reservar, presiona "Cancelar".
                    Una vez el pago este verificado, puedes ver tus reservas en la sección "Tus Reservas". 
                    Si ya abonaste y hay errores en la verificacion, puedes contactar a la microempresa para que confirmen tu abono y tu reserva.
                </Text>
                    <TouchableOpacity style={styles.verificarPagoBoton} onPress={verificarPago}>
                    <Text style={styles.verificarPagoTexto}>Verificar Pago</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelarBoton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    texto: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    verificarPagoBoton: {
        backgroundColor: "#007AFF",
        width: "80%",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    verificarPagoTexto: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    contenedorBotones: {  // Nuevo estilo agregado
        alignItems: "center", // Centra los botones horizontalmente
        width: "100%",        // Asegura que los botones ocupen todo el ancho disponible
    },
    cancelarBoton: {
        backgroundColor: "#FF3B30",
        width: "80%",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    cancelarTexto: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default ServicioPaymentScreen;