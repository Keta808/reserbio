import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
} from 'react-native';
import { obtenerPlanes } from '../services/suscripcion.service.js';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/auth.context';
import { useTheme } from '../context/theme.context';
import { verificarTrabajador } from '../services/user.service.js';
// Descripciones de los planes
const planDescriptions = {
  "Plan Gratuito": "Este es el plan gratuito y permite acceder a las funciones básicas de agenda y reserva por un plazo de tiempo determinado (3 meses de prueba).",
  "Plan Basico": "El plan Básico incluye todas las caracteristicas de agenda y reserva. No se permite agregar trabajadores a tu microempresa.",
  "Plan Premium": "El plan Premium incluye todas las caracteristicas de agenda y reserva con la posibilidad de agregar hasta 10 trabajadores a tu microempresa y soporte prioritario."
};

const SuscripcionScreen = () => {
  const [planes, setPlanes] = useState([]); // Estado para almacenar los planes
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
  const navigation = useNavigation(); // Para navegar a otras pantallas
  const { user } = useContext(AuthContext); // Obtener el usuario autenticado
  const { theme } = useTheme();
  const [isTrabajador, setIsTrabajador] = useState(false);
  // Determinar si estamos en modo oscuro.
  // En este ejemplo, se considera modo claro cuando el background es "#fff" o "#f0f4f7"
  const isDarkMode = theme.background === "#444" || theme.background === "#333" || theme.background === "#000" || theme.background !== "#fff";

  useEffect(() => {
    // Obtener los planes desde el backend
    const fetchPlanes = async () => {
      try {
        const data = await obtenerPlanes();
        if (data.state === 'Success' && Array.isArray(data.data)) {
          setPlanes(data.data);
        }
      } catch (error) {
        console.error('Error al obtener los planes:', error.message);
      } finally {
        setLoading(false);
      }
    };

    const verificarisTrabajador = async () => {
      try { 
        if (user?.email) {
        const response = await verificarTrabajador(user.email);
          setIsTrabajador(response);
      }
      } catch (error) {
        console.log('El usuario no tiene cuenta Trabajador:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
    verificarisTrabajador();
  }, [user]);
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando planes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && { backgroundColor: theme.background }]}> 
      <View style={[styles.introContainer, isDarkMode && { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" }]}>
        <Text style={[styles.mainTitle, isDarkMode && { color: theme.text }]}>
          ¡Suscríbete a un plan para utilizar la aplicacion Reserbio!
        </Text>
        <Text style={[styles.mainDescription, isDarkMode && { color: theme.text }]}>
          Nuestra aplicación ofrece planes diseñados para adaptarse a tus necesidades. 
          Elige el plan que más te convenga y disfruta de las características que tenemos para ti.
          ¡Únete y maneja tu agenda con Reserbio!
        </Text>
      </View>

      <Text style={[styles.title, isDarkMode && { color: theme.text }]}>Elige tu plan de suscripción.</Text>

      <View style={styles.plansContainer}>
        {Array.isArray(planes) && planes.length > 0 ? (
          planes.map((plan) => {
            const description = planDescriptions[plan.tipo_plan] || "Descripcion no disponible";
            return (
              <View key={String(plan._id)} style={[
                styles.planCard, 
                isDarkMode && {
                  backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444",
                  // Reducir el efecto de sombra en modo oscuro
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                }
              ]}>
                <Text style={[styles.planTitle, isDarkMode && { color: theme.text }]}>{String(plan.tipo_plan || "Sin nombre")}</Text>
                <Text style={[styles.planDescription, isDarkMode && { color: theme.text }]}>{String(description)}</Text>  
                <Text style={[styles.planPrice, isDarkMode && { color: theme.text }]}>{`$${String(plan.precio || "0")} `}</Text> 
                
                {!isTrabajador && ( // Ocultar el botón si el usuario es trabajador
                  <TouchableOpacity 
                    style={[styles.planButton, isDarkMode && { backgroundColor: "#0077b6" }]}
                    onPress={() => navigation.navigate('Pago', { selectedPlan: plan, user })}
                  >
                    <Text style={[styles.planButtonText, isDarkMode && { color: theme.text }]}>SUSCRIBIRSE</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <Text>{String("No se encontraron planes disponibles.")}</Text>
        )}
      </View> 

      <View style={[styles.disclaimerContainer, isDarkMode && { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" }]}>
        <Text style={[styles.disclaimerText, isDarkMode && { color: theme.text }]}>
          Nota: La suscripción al plan seleccionado se cobrará de manera mensual una vez obtenido el plan. 
          Puedes gestionar tu suscripción a través de la aplicación. {"\n\n"} 
          IMPORTANTE: Una vez acabado el plazo de prueba o si cancelas una suscripcion, la informacion de tu microempresa será eliminada y si quieres seguir utilizando la aplicación deberás volver a suscribirte a otro plan. 
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
    borderWidth: 2,
    borderColor: '#ddd',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'Inter',
    color: '#0077b6',
    marginBottom: 10,
  },
  mainDescription: {
    fontSize: 18,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'Inter',
    marginBottom: 20,
    textAlign: 'center'
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 16,
    marginBottom: 10,
  }, 
  planPrice: {
    fontSize: 20,
    fontWeight: 'Inter',
    marginBottom: 10,
    color: '#FF6347',
  },
  planButton: {
    padding: 10,
    backgroundColor: '#0077b6',
    borderRadius: 8,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disclaimerContainer: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
});

export default SuscripcionScreen;
