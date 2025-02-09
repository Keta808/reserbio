import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getUserSubscription, cancelarSuscripcion } from '../services/suscripcion.service';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/auth.context';


const GestorSuscripcionScreen = () => { 
  const { user } = useContext(AuthContext);
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); 
  useEffect(() => {
    const fetchSubscription = async () => {
      try { 
        if (!user || !user.id) {
          throw new Error("Usuario no autenticado o sin ID válido");
        } 
        console.log("ID de usuario autenticado:", user.id); 
        const response = await getUserSubscription(user.id);
        if (response.state === 'Success') {
          setSuscripcion(response.data);
        } else {
          Alert.alert('Error', 'No se pudo obtener la suscripción');
          setSuscripcion(null);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error.message || error);
        Alert.alert('Error', 'No se pudo obtener la suscripción');
        setSuscripcion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []); 
  // cancelar suscripción
  const handleCancelSubscription = async () => {
    Alert.alert(
      "Cancelar Suscripción",
      "¿Estás seguro de que deseas cancelar tu suscripción? Se borraran tus datos y no podrás usar la aplicación como MICROEMPRESA hasta que consigas una nueva suscripción.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const idUser = user.id;
              const preapprovalId = suscripcion.id;
              console.log("Cancelando suscripción con:", { idUser, preapprovalId });

              const response = await cancelarSuscripcion(idUser, preapprovalId);
              if (response.state === 'Success') {
                Alert.alert('Éxito', 'Suscripción cancelada con éxito');
                setSuscripcion(null);
                await logout();
                navigation.navigate("Login");

              } else {
                Alert.alert('Error', 'No se pudo cancelar la suscripción');
              }
            } catch (error) {
              console.error("Error cancelling subscription:", error.message || error);
              Alert.alert('Error', 'No se pudo cancelar la suscripción');
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  // actualizar tarjeta de crédito
  const actualizarPaymentInfo = async () => { 
    navigation.navigate('CardScreen', { suscripcion, user });
  };
  const handleVolver = () => {
    navigation.goBack();
  };

  const statusMap = {
    authorized: "Activo",
    paused: "Pausado",
    cancelled: "Cancelado",
    pending: "Pendiente",
    expired: "Expirado",
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
 

  if (!suscripcion) {
    return (
      <View style={styles.center}>
        <Text>No tienes una suscripción activa.</Text>
      </View>
    );
  }
  const { status, reason, date_created, next_payment_date } = suscripcion;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestor de Suscripciones</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información de la Suscripción</Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Estado: </Text>
          {statusMap[status] || 'N/A'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Plan: </Text>
          {reason || 'N/A'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Fecha de inicio: </Text>
          {new Date(date_created).toLocaleDateString("es-Es") || 'N/A'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Próximo pago: </Text>
          {new Date(next_payment_date).toLocaleDateString("es-Es") || 'N/A'}
        </Text>
      </View>
    
    {/* Botones para acciones */}
    <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCancelSubscription}>
          <Text style={styles.buttonText}>Cancelar Suscripción</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={actualizarPaymentInfo}>
          <Text style={styles.buttonText}>Actualizar Datos de Pago</Text>
        </TouchableOpacity> 
        <TouchableOpacity style={styles.button} onPress={handleVolver}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity> 
    </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSubscriptionText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonsContainer: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GestorSuscripcionScreen;