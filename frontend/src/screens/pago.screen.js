import React, { useState, useEffect } from 'react'; 
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import MercadoPagoCheckout from '@mercadopago/sdk-js'; 

// import MercadoPagoCheckout from '@mercadopago/sdk-js';
import { crearSuscripcion } from '../services/suscripcion.service'; 
import { useNavigation } from '@react-navigation/native'; 
// Context:
import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';

const PaymentScreen = ({ route }) => {
    const { selectedPlan } = route.params; // Obtenemos el usuario y el plan seleccionado
    const { user } = useContext(AuthContext); 
    const navigation = useNavigation();

    const [loading, setLoading] = useState(false);
    const [cardToken, setCardTokenId] = useState('');

    // Inicializamos MercadoPago con la clave pública
    useEffect(() => {
        try {
            MercadoPagoCheckout.setPublicKey('TEST-e049e8d4-7a1d-4a6e-933e-52ff9ece02e3'); // Cambiar por la Real
        } catch (error) {
            console.error('Error inicializando MercadoPago:', error.message);
            Alert.alert('Error', 'No se pudo inicializar MercadoPago. Intenta de nuevo más tarde.');
        }
    }, []);

    // Función para procesar el pago
    const handlePayment = async () => {
        if (!cardToken) {
            Alert.alert('Error', 'Por favor ingresa los datos de la tarjeta.');
            return;
        }
    
        setLoading(true);
    
        try {
            const response = await crearSuscripcion(selectedPlan.tipo_plan, user, cardToken); // Envía el token, usuario y plan
            if (response.state === 'Success') {
                Alert.alert('Éxito', 'Tu suscripción ha sido activada correctamente.');
                navigation.navigate('Home');
            } else {
                Alert.alert('Error', response.message || 'Hubo un problema al procesar el pago.');
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            Alert.alert('Error', 'Hubo un problema al procesar el pago. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleCardFormSubmit = (cardFormData) => {
        const { token } = cardFormData || {};
        if (token) {
            setCardTokenId(token);
        } else {
            Alert.alert('Error', 'No se pudo generar el token. Verifica los datos de tu tarjeta.');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Detalles de pago para {selectedPlan.tipo_plan}</Text>

            {/* Formulario de pago con CardForm */}
            <MercadoPagoCheckout.CardForm
                style={{ width: '100%' }}
                onSubmit={handleCardFormSubmit}
            />

            <Button
                title="Pagar"
                onPress={handlePayment}
                disabled={loading || !cardToken}
            />

            {loading && <ActivityIndicator size="large" />}
        </View>
    );
};

export default PaymentScreen;