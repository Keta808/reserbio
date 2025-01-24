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
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchMicroempresas = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          Alert.alert('Error', 'No se encontró el ID del usuario');
          return;
        }

        // console.log('👤 ID de usuario encontrado:', userId);
        setUserId(userId);
        const response = await MicroempresaService.getMicroempresasByUser(userId);
        // console.log('📦 microempresa encontrada en screen:', response);
    
        // ✅ Valida que la respuesta sea un array antes de actualizar el estado
        if (Array.isArray(response.data)) {
          setMicroempresas(response.data);
        } else {
          setMicroempresas([]);
          Alert.alert('Error', 'No se pudieron cargar las microempresas');
        }
      } catch (error) {
        // console.error('Error al obtener microempresas:', error);
        Alert.alert('Error', 'Ocurrió un error al obtener las microempresas');
      }
    };     
    fetchMicroempresas();
  }
  , []);

  // ✅ Función para manejar la selección de una microempresa
  const handleSelectMicroempresa = (id) => {
    try{
      if (!id || !userId) {
        console.error('Error: Parámetros inválidos:', { id, userId });
        Alert.alert('Error', 'No se pudo navegar a la microempresa.');
        return;
      }
      
      // console.log("Redirigiendo a la microempresa con ID:", response.data._id, "y userId:", userId);
      
      console.log('🔍 Navegando a la screen Microempresa con:', { id, userId });
     
     // 🔍 Verifica el ID que se está pasando
      // navigation.navigate('Microempresa', { id, userId }); uso previo de navigate
      
      navigation.navigate('Microempresa', { id, userId });
    }catch(error){
      console.error('Error al seleccionar la microempresa:', error);
      Alert.alert('Error', 'Ocurrió un error al seleccionar la microempresa');
    }
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
