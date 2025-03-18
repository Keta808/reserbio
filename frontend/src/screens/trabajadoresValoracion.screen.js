import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import ValoracionService from "../services/valoracion.service"; // Ajusta la ruta según tu proyecto
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../context/theme.context";

export default function TrabajadorValoracionesScreen({ route, navigation }) {
  const { trabajador } = route.params;
  const { theme } = useTheme();
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(trabajador);

  // Umbral mínimo de valoraciones
  const MIN_RATINGS = 3;

  useEffect(() => {
    async function fetchValoraciones() {
      try {
        const ratings = await ValoracionService.getValoracionesPorTrabajador(trabajador._id);
        setValoraciones(ratings);
      } catch (error) {
        console.error("Error al obtener las valoraciones:", error);
        // Si llega un array vacío, se considerará que no hay valoraciones
        setValoraciones([]);
      } finally {
        setLoading(false);
      }
    }
    fetchValoraciones();
  }, [trabajador._id]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={{ color: theme.text }}>Cargando valoraciones...</Text>
      </View>
    );
  }

  // Calcula el promedio si hay suficientes valoraciones
  let averageRating = 0;
  if (valoraciones.length >= MIN_RATINGS) {
    averageRating =
      valoraciones.reduce((sum, item) => sum + item.puntuacion, 0) / valoraciones.length;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Datos del Trabajador */}
      <Text style={[styles.title, { color: theme.text }]}>Datos del Trabajador</Text>
      <View
        style={[
          styles.infoContainer,
          { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" },
        ]}
      >
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Nombre: </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {trabajador.nombre} {trabajador.apellido}
          </Text>
        </View>
        {trabajador.email && (
              <View style={styles.infoRow}>
                <Icon name="envelope" size={20} color="#007BFF" style={styles.infoIcon} />
                <Text style={[styles.label, { color: theme.text }]}>Email: </Text>
                <Text style={[styles.value, { color: theme.text }]}>{trabajador.email}</Text>
              </View>
            )}
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Teléfono: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{trabajador.telefono}</Text>
        </View>
      </View>

      {/* Sección de Valoraciones */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Valoraciones</Text>
      {valoraciones.length < MIN_RATINGS ? (
        <Text style={[styles.warningText, { color: "#FF3B30" }]}>
          Este trabajador no tiene suficientes valoraciones.
        </Text>
      ) : (
        <>
          <View style={styles.promedioContainer}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={[styles.promedioText, { color: theme.text }]}>
              Promedio: {averageRating.toFixed(2)}
            </Text>
          </View>
          <FlatList
            data={valoraciones}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.ratingCard,
                  { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#333" },
                ]}
              >
                <View style={styles.ratingHeader}>
                  <Icon name="user" size={18} color="#007BFF" style={styles.ratingIcon} />
                  <Text style={[styles.clienteName, { color: theme.text }]}>
                    {item.cliente?.nombre || "Cliente desconocido"}
                  </Text>
                </View>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={18} color="#FFD700" style={styles.ratingIcon} />
                  <Text style={[styles.ratingText, { color: theme.text }]}>
                    Puntuación: {item.puntuacion}
                  </Text>
                </View>
                <Text style={[styles.comentario, { color: theme.text }]}>{item.comentario}</Text>
              </View>
            )}
          />
        </>
      )}
      
        <TouchableOpacity style={styles.atrasBackButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.atrasBackButtonText, { color: '#fff' }]}>Atrás</Text>
        </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  infoContainer: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },
  value: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  warningText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
  promedioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  promedioText: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
  },
  ratingCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingIcon: {
    marginRight: 8,
  },
  clienteName: {
    fontSize: 18,
    fontWeight: "700",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  comentario: {
    fontSize: 16,
    color: "#6C757D",
  },

  atrasBackButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  atrasBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

});
