import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from 'react-native';
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
            <Text style={styles.title}>Bienvenido Cliente</Text>
            
            <Button
                title="Ver Lista de Microempresas"
                onPress={handleGoToListaMicroempresas}
                color="#28A745"
            />

            <Button
                title="Aceptar Invitación"
                onPress={handleGoToAceptarInvitacion}
                color="#007BFF" // Azul para diferenciarlo
            />

            <Button
                title="Cerrar Sesión"
                onPress={handleLogout}
                color="#FF0000"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
});



