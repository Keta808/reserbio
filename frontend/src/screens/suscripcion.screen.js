import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { obtenerPlanes } from '../services/suscripcion.service.js'; // Asegúrate de que el import sea correcto
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/auth.context';
// Descripciones de los planes
const planDescriptions = {
  "Plan Gratuito": "Este es el plan gratuito y permite acceder a las funciones básicas del sistema por un plazo de tiempo determinado (3 meses de prueba).",
  "Plan Basico": "El plan Básico incluye todas las caracteristicas de agenda y reserva del sistema con la posibilidad de agregar hasta 2 trabajadores a tu microempresa.",
  "Plan Premium": "El plan Premium incluye incluye todas las caracteristicas de agenda y reserva del sistema con la posibilidad de agregar hasta 8 trabajadores a tu microempresa y soporte prioritario."
};

const SuscripcionScreen = () => {
  const [planes, setPlanes] = useState([]); // Estado para almacenar los planes
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
  const navigation = useNavigation(); // Para navegar a otras pantallas
  const { user } = useContext(AuthContext); // Obtener el usuario autenticado
  useEffect(() => {
    // Obtener los planes desde el backend
    const fetchPlanes = async () => {
      try {
        const data = await obtenerPlanes(); // Llamada al backend para obtener los planes
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
    {/* Sección de introducción */}
      <View style={styles.introContainer}>
        <Text style={styles.mainTitle}>¡Suscríbete a un plan para utilizar la aplicacion Reserbio!</Text>
        <Text style={styles.mainDescription}>
          Nuestra aplicación ofrece planes diseñados para adaptarse a tus necesidades. 
          Elige el plan que más te convenga y disfruta de las características que tenemos para ti.
          !Unetenos y maneja tu agenda con Reserbio¡
        </Text>
      </View>

    {/* Listado de planes */}
      <Text style={styles.title}>Elige tu plan de suscripción.</Text>
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
                  onPress={() => navigation.navigate('Pago', {selectedPlan: plan, user })} // Navegar a la pantalla de pago
                />
              </View>
            );
          })
        ) : (
          <Text>No se encontraron planes disponibles.</Text> // Mostrar mensaje si no hay planes
        )}
      </View> 

      {/* Disclaimer */} 
      <View style={styles.disclaimerContainer}>
      <Text style={styles.disclaimerText}>
        Nota: La suscripción al plan seleccionado se cobrará de manera mensual una vez obtenido el plan. 
        Puedes gestionar tu suscripción a través de la aplicación. 
      </Text>
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
  introContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 10,
  },
  mainDescription: {
    fontSize: 16,
    color: '#555',
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
  disclaimerContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default SuscripcionScreen;