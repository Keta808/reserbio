import React, { useEffect, useState } from 'react'; 
import { View, Alert, ActivityIndicator } from 'react-native'; 
import { WebView } from 'react-native-webview'; 
import mercadoPagoServices from '../services/mercadopago.service'; 


export default function MercadoPagoScreen({ route, navigation }) {

    const { idMicroempresa } = route.params; 
    const [authUrl, setauthUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vinculacion, setVinculacion] = useState(null); 
    const [mpRedirectUri, setMpRedirectUri] = useState(null); 

    if (!idMicroempresa){ 
        Alert.alert("Error", "No se proporcionó el ID de la microempresa.");
        navigation.goBack();
        return null;
    } 
    if (vinculacion) {
        Alert.alert("Cuenta de MercadoPago vinculada", "Tu cuenta de MercadoPago ya esta vinculada."); 
        navigation.goBack();
    } 

    useEffect(() => {
        const obtenerUrlVinculacion = async () => {
            
            try { 
                console.log("ID de microempresa:", idMicroempresa);
                // Obtener la URL de redirección de MercadoPago
                const [redirectData, redirectError] = await mercadoPagoServices.obtenerRedirect();
                if (redirectError) {
                    throw new Error("No se pudo obtener la URL de redirección de MercadoPago.");
                }
                console.log("MP_REDIRECT_URI obtenida:", redirectData.data.MP_REDIRECT_URI);
                setMpRedirectUri(redirectData.data.MP_REDIRECT_URI); 

                const [url, error] = await mercadoPagoServices.generarUrlOnBoarding(idMicroempresa);
                if (error) {
                    Alert.alert("Error al obtener la URL de vinculación con MercadoPago:", error);
                    navigation.goBack();
                    return;
                }
                console.log("URL de vinculación con MercadoPago generada:", url.data);
                setauthUrl(url.data);
            } catch (error) {
                console.error("Error al generar la URL de vinculación con MercadoPago:", error);
                Alert.alert("Error al generar la URL de onBoarding MercadoPago:", error.message);
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        }; 
        obtenerUrlVinculacion();

    }, [idMicroempresa]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    } 

    if(!authUrl){
        console.error("No se pudo generar la URL de Mercado Pago.");
        Alert.alert("Error", "No se pudo generar la URL de Mercado Pago.")
        navigation.goBack();
        return null;
    } 
    const handleNavigationChange = async (navState) => {
        const { url } = navState;
        if(!mpRedirectUri) return;

        if(url.includes(mpRedirectUri)){
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const code = urlParams.get('code'); 
            const idMicroempresa = urlParams.get('state');
            console.log("Código de autorización:", code);
            console.log("ID de microempresa:", idMicroempresa);
            if (code && idMicroempresa) {
                try {
                    const [response, error] = await mercadoPagoServices.onBoarding(code, idMicroempresa);
                    if (error) {
                        Alert.alert("Error al vincular la cuenta de MercadoPago:", error);
                       
                    }else {
                        Alert.alert("Vinculación exitosa", "Tu cuenta de MercadoPago ha sido vinculada exitosamente.");
                        console.log("Cuenta de MercadoPago vinculada:", response);
                        setVinculacion(response);  
                    }
                } catch (error){
                    Alert.alert("Error al vincular la cuenta de MercadoPago:", error);
                    console.error("Error en OnBoarding:", error);
                } finally {
                    navigation.goBack();
                }
            }
        }
            
    }

    return (
        <WebView
            source ={{ uri: authUrl }}
            style={{ flex: 1 }} 
            onNavigationStateChange = {handleNavigationChange}
        />

    );

}