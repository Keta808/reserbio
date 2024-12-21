import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { obtenerPlanes } from '../services/suscripcion.service.js'; // Asegúrate de que el import sea correcto
import { useNavigation } from '@react-navigation/native';

// Descripciones de los planes
const planDescriptions = {
  "Plan Gratuito": "Este plan es gratuito y permite acceder a las funciones básicas del sistema por un plazo de tiempo determinado.",
  "Plan Basico": "El plan básico incluye todas las caracteristicas de agenda y reserva del sistema (hasta 2 trabajadores).",
  "Plan Premium": "El plan Premium incluye acceso completo a todas las características avanzadas y soporte prioritario (hasta 8 trabajadores) ."
};

const SuscripcionScreen = () => {
  const [planes, setPlanes] = useState([]); // Estado para almacenar los planes
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
  const navigation = useNavigation(); // Para navegar a otras pantallas

  useEffect(() => {
    // Obtener los planes desde el backend
    const fetchPlanes = async () => {
      try {
        const data = await obtenerPlanes(); // Llamada a la API para obtener los planes
        if (data.state === 'Success' && Array.isArray(data.data)) {  // Verificar que 'data.data' sea un arreglo
          setPlanes(data.data); // Almacenar el arreglo en el estado
        }
      } catch (error) {
        console.error('Error al obtener los planes:', error.message);
      } finally {
        setLoading(false); // Terminar el loading después de la llamada
      }
    };
    fetchPlanes();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando planes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Elige tu plan de suscripción</Text>
      <View style={styles.plansContainer}>
        {Array.isArray(planes) && planes.length > 0 ? (
          planes.map((plan) => {
            const description = planDescriptions[plan.tipo_plan]; // Obtener la descripción del plan
            return (
              <View key={plan._id} style={styles.planCard}>
                <Text style={styles.planTitle}>{plan.tipo_plan}</Text>
                <Text style={styles.planDescription}>{description}</Text> {/* Descripción del plan */} 
                <Text style={styles.planPrice}>${plan.precio}</Text> {/* Precio del plan */}
                <Button
                  title="Obtener"
                  onPress={() => navigation.navigate('Pago', { planId: plan._id })} // Navegar a la pantalla de pago
                />
              </View>
            );
          })
        ) : (
          <Text>No se encontraron planes disponibles.</Text> // Mostrar mensaje si no hay planes
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
  },
  plansContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  planCard: {
    width: '48%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 10,
  }, 
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF6347',
  },
});

export default SuscripcionScreen;