import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MicroempresaService from '../services/microempresa.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserId = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.id;
    } else {
      console.error('No se encontraron datos de usuario en AsyncStorage');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener datos de AsyncStorage:', error);
    return null;
  }
};

export default function SeleccionMicroempresaScreen() {
  const [microempresas, setMicroempresas] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMicroempresas = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          Alert.alert('Error', 'No se encontró el ID del usuario');
          return;
        }

        console.log('👤 ID de usuario encontrado:', userId);
        const response = await MicroempresaService.getMicroempresasByUser(userId);
        console.log('📦 microempresa encontrada en screen:', response);
    
        // ✅ Valida que la respuesta sea un array antes de actualizar el estado
        if (Array.isArray(response.data)) {
          setMicroempresas(response.data);
        } else {
          setMicroempresas([]);
          console.log('Error', 'No se pudieron cargar las microempresas');
        }
      } catch (error) {
        console.error('Error al obtener microempresas:', error);
        Alert.alert('Error', 'Ocurrió un error al obtener las microempresas');
      }
    };     
    fetchMicroempresas();
  }
  , []);

  // ✅ Función para manejar la selección de una microempresa
  const handleSelectMicroempresa = (id) => {
    console.log('📲 Navegando al perfil de la microempresa con ID:', id); // 🔍 Verifica el ID que se está pasando
    navigation.navigate('Microempresa', { id });
  };  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seleccione su microempresa</Text>
      {Array.isArray(microempresas) && microempresas.length === 0 ? (
        <Text style={styles.noData}>No se encontraron microempresas asociadas.</Text>
      ) : (
        Array.isArray(microempresas) &&
        microempresas.map((micro) => (
          <View key={micro._id} style={styles.microempresaContainer}>
            <Text style={styles.microempresaName}>{micro.nombre}</Text>
            <Button
              title="Ver Perfil"
              onPress={() => handleSelectMicroempresa(micro._id)}
            />
          </View>
        ))
      )}
    </ScrollView>
  );  
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noData: {
    fontSize: 16,
    color: 'gray',
  },
  microempresaContainer: {
    marginBottom: 20,
    width: '100%',
  },
  microempresaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
