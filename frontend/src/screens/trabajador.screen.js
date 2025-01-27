import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native'; 
import { useNavigation } from '@react-navigation/native'; 
import { AuthContext } from '../context/auth.context';
// Llamar services de usuario para actualizar datos y botones
import { getTrabajadorById } from '../services/user.service';
export default function TrabajadorScreen() {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation(); 
    const [dataTrabajador, setDataTrabajador] = useState(null);
    const [loading, setLoading] = useState(true);
   

    useEffect(() => {
        const fetchTrabajadorData = async () => {
          try {
            if (!user) {
              throw new Error("No se pudo identificar al trabajador.");
            }
    
            const trabajadorData = await getTrabajadorById(user.id);
            

            setDataTrabajador(trabajadorData);
          } catch (error) {
            console.error("Error fetching trabajador data:", error.message || error);
            Alert.alert("Error", "No se pudo cargar la información del trabajador.");
          } finally {
            setLoading(false);
          }
        };
    
        fetchTrabajadorData();
      }, [user]);
    
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text>Cargando perfil del trabajador...</Text>
          </View>
        );
      }
    
      if (!dataTrabajador) {
        return (
          <View style={styles.container}>
            <Text style={styles.error}>No se pudo cargar la información del trabajador.</Text>
          </View>
        );
      }
  
    

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Perfil del Trabajador</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{dataTrabajador.data.nombre || 'Sin nombre'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Apellido:</Text>
              <Text style={styles.value}>{dataTrabajador.data.apellido || 'Sin apellido'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{dataTrabajador.data.telefono || 'Sin teléfono'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{dataTrabajador.data.email || 'Sin email'}</Text>
            </View>
          </View>
    
          <View style={styles.buttonContainer}>
            <Button
              title="Editar Perfil"
              onPress={() => navigation.navigate('Reservar', { trabajadorId: user.id })}
              color="blue"
            />
            <View style={{ marginVertical: 10 }}>
              <Button
                title="Gestionar Suscripción"
                onPress={() => navigation.navigate('GestorSuscripcion')}
                color="#007BFF"
              />
            </View>
            <Button
              title="Volver"
              onPress={() => navigation.goBack()}
              color="#FF6347"
            />
          </View>
        </View>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  }, 
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', 
    color: '#007BFF',
  },
  infoContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});