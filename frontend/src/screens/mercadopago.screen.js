import React, { useEffect, useState } from 'react'; 
import { View, Alert, ActivityIndicator } from 'react-native'; 
import { WebView } from 'react-native-webview'; 
import mercadoPagoServices from '../services/mercadopago.service'; 



export default function MercadoPagoScreen({ route, navigation }) {

    const { idMicroempresa } = route.params; 
    const [authUrl, setauthUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorVinculacion, setErrorVinculacion] = useState(null); 
    const [hasNavigated, setHasNavigated] = useState(false);
    

    

    useEffect(() => {
        const obtenerUrlVinculacion = async () => {
            
            try { 
                console.log("ID de microempresa:", idMicroempresa);
                // Obtener la URL de redirección de MercadoPago
                
                const [url, error] = await mercadoPagoServices.generarUrlOnBoarding(idMicroempresa);
                if (error) {
                    console.log("Error al obtener la URL de vinculación con MercadoPago:", error.message);  
                    setErrorVinculacion(error.message)
                    return;
                }
                console.log("URL de vinculación con MercadoPago generada:", url.data);
                setauthUrl(url.data);
            } catch (error) {
                console.log("Error al generar la URL de vinculación con MercadoPago.");
                
                setErrorVinculacion(error.message);
            } finally {
                setLoading(false);
            }
        }; 
        obtenerUrlVinculacion();

    }, [idMicroempresa]);

    useEffect(() => {
        console.log("Error de vinculación:", errorVinculacion);
        if (errorVinculacion && !hasNavigated) {
            setHasNavigated(true); // Evita múltiples ejecuciones de navegación
            Alert.alert("Error al vincular la cuenta de MercadoPago", errorVinculacion, [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                }
            ]);        
        }
    }, [errorVinculacion, hasNavigated]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    } 
    if(!authUrl) {
        return null; 
    }
   
    const handleNavigationChange = async (navState) => {
        const { url } = navState;
        console.log("URL actual:", url);
        
        
        if(url.includes("code=") && url.includes("state=")){
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const code = urlParams.get('code'); 
            const idMicroempresa = urlParams.get('state');
            console.log("Código de autorización:", code);
            console.log("ID de microempresa:", idMicroempresa);
            if (code && idMicroempresa) {
                try {
                    const [response, error] = await mercadoPagoServices.onBoarding(code, idMicroempresa);
                    if (error) {
                        console.log("Error en OnBoarding:", error);
                        setErrorVinculacion(error);
                       
                    } else {
                        Alert.alert("Vinculación exitosa", "Tu cuenta de MercadoPago ha sido vinculada exitosamente.");
                        console.log("Cuenta de MercadoPago vinculada:", response); 
                    }
                } catch (error){
                    console.log("Error en OnBoarding:", error);
                    setErrorVinculacion("Error al vincular la cuenta de MercadoPago");
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