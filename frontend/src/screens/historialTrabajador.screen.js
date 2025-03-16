import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import enlaceService from '../services/enlace.service';
import { useTheme } from '../context/theme.context';
import { useNavigation } from '@react-navigation/native';

export default function HistorialTrabajadorScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { idTrabajador } = route.params;
  const { theme } = useTheme();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await enlaceService.obtenerHistorialMicroempresas(idTrabajador);
        if (response.state === 'Success') {
          setHistorial(response.data);
        }
      } catch (error) {
        console.error('Error al obtener historial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [idTrabajador]);

  const formatDate = (dateString) => {
    if (!dateString) return "No especificado"; // Manejar fechas nulas o vacías
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={{ color: theme.text }}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Historial de Actividades</Text>
      <FlatList
        data={historial}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemContainer,
              { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" },
            ]}
          >
            <Text style={[styles.microempresaName, { color: theme.text }]}>
              {item.nombre_microempresa}
            </Text>
            <Text style={[styles.itemText, { color: theme.text }]}>
              Fecha de inicio: {formatDate(item.fecha_inicio)}
            </Text>
            <Text style={[styles.itemText, { color: theme.text }]}>
              Fecha de término: {formatDate(item.fecha_termino)}
            </Text>
          </View>
        )}
      />
      {/* Contenedor del boton final */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Text style={styles.buttonText}>Volver a Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    itemContainer: { padding: 10, borderRadius: 8, marginBottom: 8 },
    itemText: { fontSize: 16 },
    microempresaName: { fontSize: 18, fontWeight: "bold" },
  
    // Estilos para el botón
    buttonContainer: {
      marginTop: 10,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    button: {
      backgroundColor: "#007bff",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: "100%",
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
