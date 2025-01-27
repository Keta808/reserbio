import React,{ useContext} from "react";
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/auth.context';
import { useNavigation } from '@react-navigation/native';


export default function HomeClienteScreen() {
    const { logout } = useContext(AuthContext); 
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    }

    const handleGoToListaMicroempresas = () => {
        navigation.navigate('ListaMicroempresas');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido Cliente</Text>
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


