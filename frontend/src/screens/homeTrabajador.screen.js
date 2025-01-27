import React,{ useContext} from "react";
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/auth.context';
import { useNavigation } from '@react-navigation/native'; 


export default function HomeTrabajadorScreen() {
    const { logout } = useContext(AuthContext); 
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    }
    // CREAR PANTALLA DE PERFIL TRABAJADOR
    const handleGoToPerfilTrabajador = () => {
        navigation.navigate('Perfil');
    } 
    const handleGoToListaMicroempresas = () => {
        navigation.navigate('ListaMicroempresas');
    }
    const handleGoToSuscripcion = () => {
        navigation.navigate('Suscripcion');
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido Trabajador</Text>
            <Button
                title="Ver Perfil"
                onPress={handleGoToPerfilTrabajador}
                color="#0000FF"
            /> 
             <Button
                title="Suscribirse"
                onPress={handleGoToSuscripcion}
                color="#1E90FF"
            /> 
            <Button
                title="Ver Lista de Microempresas"
                onPress={handleGoToListaMicroempresas}
                color="#28A745"
            /> 
           

            <Button
                title
                ="Cerrar Sesión"
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