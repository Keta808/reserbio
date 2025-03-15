import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/theme.context';
import invitacionService from '../services/invitacion.service';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';

const InvitacionesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [invitaciones, setInvitaciones] = useState([]);
  console.log("\ud83d\udccc route.params:", route.params);
  const idMicroempresa = route.params?.idMicroempresa || route.params?.microempresaId || null;
  console.log("\ud83d\udccc ID recibido:", idMicroempresa);

  useFocusEffect(
    useCallback(() => {
      fetchInvitaciones();
    }, [])
  );

  const fetchInvitaciones = async () => {
    if (!idMicroempresa) {
      console.error('❌ Error: ID de la microempresa no proporcionado.');
      return;
    }
  
    try {
      const data = await invitacionService.obtenerInvitacionesPendientes(idMicroempresa);
      console.log('📋 Respuesta completa del backend:', JSON.stringify(data, null, 2));
      
      const invitacionesLista = data?.data?.data || [];
  
      invitacionesLista.forEach((inv, index) => {
        if (!inv?.id) {
          console.warn(`⚠️ La invitación en el índice ${index} no tiene ID:`, inv);
        }
      });
  
      setInvitaciones(invitacionesLista);
    } catch (error) {
      console.error('❌ Error al obtener invitaciones:', error);
    }
  };

  const handleEliminar = (id) => {
    Alert.alert('Eliminar Invitación', '¿Seguro que deseas eliminar esta invitación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', onPress: () => eliminarInvitacion(id), style: 'destructive' }
    ]);
  };

  const eliminarInvitacion = (id) => {
    setInvitaciones(prev => prev.filter(inv => inv.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Invitaciones</Text>

      {invitaciones.length > 0 ? (
        <FlatList
          data={invitaciones}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <TouchableOpacity 
                key={item._id} 
                style={[
                  styles.card,
                  { 
                    backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444",
                    borderColor: theme.background === "#FFFFFF" ? "#ddd" : "#444" 
                  }
                ]}
                onPress={() => console.log("Invitación seleccionada:", item)}
              >
                <View style={styles.infoContainer}>
                  <Text style={[styles.servicioName, { color: theme.text }]}>{item.email}</Text>
                  <Text style={[styles.servicioDetail, { color: theme.text }]}>Estado: {item.estado}</Text>
                  <Text style={[styles.servicioDetail, { color: theme.text }]}>Código: {item.codigoInvitacion}</Text>
                </View>
                <TouchableOpacity onPress={() => handleEliminar(item._id)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color={theme.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={[styles.noInvitaciones, { color: theme.text }]}>No hay invitaciones pendientes.</Text>
      )}

      {/* Botón para volver al perfil */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver al Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between", // Distribuye contenido y botón al final
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center", 
  },
  cardContainer: {
    width: "100%", 
    alignItems: "center", 
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    width: "90%",
    borderColor: "#ccc",
    backgroundColor: "#fff",
    shadowColor: "transparent",
    elevation: 0,
  },
  servicioName: {
    fontSize: 16,
    fontWeight: "bold",
  },  
  infoContainer: {
    flex: 1, 
    justifyContent: "center",
  },
  deleteButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  noInvitaciones: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#007bff", // Azul llamativo
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20, // Espacio al final
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default InvitacionesScreen;


