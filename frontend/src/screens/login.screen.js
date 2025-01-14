import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

import { AuthContext } from '../context/auth.context';



export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    
  
    const email_prueba = 'trabajador@email.com';
    const password_prueba = 'trabajador123';

    const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert('Error', 'Por favor, complete todos los campos');
        return;
      }
      try {
          //console.log(' 1 Datos para login:', email, password);
          const dataUser = {email, password}; 
  
          const userInfo = await login(dataUser); 
          //console.log("userInfo", userInfo);
        
          console.log('Usuario autenticado:', userInfo);
          
        
          Alert.alert('Inicio de sesión exitoso', `Bienvenido, ${email}`);
          
         
        
      } catch (error) {
        Alert.alert('Error', 'El usuario o la contraseña son incorrectos');
      }
    };

    //logeo temporal para no escribir todo el rato

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


    console.log('LoginScreen - Rendering');
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
        <Button title ='logeo rapido con trabajador' onPress={ handleLoginPrueba} />
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
  });