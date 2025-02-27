import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/auth.context';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigation = useNavigation();
  
    const email_prueba = 'trabajador@email.com';
    const password_prueba = 'trabajador123';

    const cliente_prueba= 'cliente@email.com';
    const password_cliente ='cliente123';

    const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert('Error', 'Por favor, complete todos los campos');
        return;
      }
      try {
          const dataUser = {email, password}; 
          const userInfo = await login(dataUser); 
          console.log('Usuario autenticado:', userInfo); 
          Alert.alert('Inicio de sesión exitoso', `Bienvenido, ${email}`);
      } catch (error) {
        Alert.alert('Error', 'El usuario o la contraseña son incorrectos');
      }
    };

    const handleLoginPrueba = async () => {
      try {
          const dataUser = {email: email_prueba, password: password_prueba};
          const userInfo = await login(dataUser);
          console.log('Usuario autenticado:', userInfo);
          Alert.alert('Inicio de sesión exitoso', `Bienvenido, ${email_prueba}`);
      } catch (error) {
        Alert.alert('Error', 'El usuario o la contraseña son incorrectos');
      }
    }

    const handleLoginCliente = async () => {
      try {
          const dataUser = {email: cliente_prueba, password: password_cliente};
          const userInfo = await login(dataUser);
          console.log('Usuario autenticado:', userInfo);
          Alert.alert('Inicio de sesión exitoso', `Bienvenido, ${cliente_prueba}`);
      } catch (error) {
        Alert.alert('Error', 'El usuario o la contraseña son incorrectos');
      }
    }

    const handleGoToRegister = () => {
      navigation.navigate('RegistroCliente');
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Ingresar" onPress={handleLogin} />
        <Button title ='logeo rapido con trabajador' onPress={handleLoginPrueba} />
        <Button title ='logeo rapido con cliente' onPress={handleLoginCliente} />
        
        <TouchableOpacity onPress={handleGoToRegister}>
          <Text style={styles.registerText}>¿Aún no tienes una cuenta? <Text style={styles.registerLink}>Regístrate aquí</Text></Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 15,
      padding: 10,
    },
    registerText: {
      textAlign: 'center',
      marginTop: 15,
      fontSize: 14,
    },
    registerLink: {
      color: '#007BFF',
      fontWeight: 'bold',
    }
  });
