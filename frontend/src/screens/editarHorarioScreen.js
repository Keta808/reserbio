import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import horarioService from "../services/horario.service";

const EditarHorarioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { horarioId, trabajadorId, dia, bloquesExistentes = [] } = route.params;

  const [bloques, setBloques] = useState(bloquesExistentes);
  const [nuevoBloque, setNuevoBloque] = useState({ hora_inicio: "", hora_fin: "" });
  const [diasDisponibles, setDiasDisponibles] = useState([]);
  const [selectedDia, setSelectedDia] = useState(dia || null);

  useEffect(() => {
    if (!horarioId) {
      fetchDiasDisponibles();
    }
  }, []);

  const fetchDiasDisponibles = async () => {
    try {
      const response = await horarioService.getDiasSinHorario(trabajadorId);
      console.log ("Dias disponibles:", response);
      setDiasDisponibles(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron obtener los días disponibles.");
    }
  };

  const handleAddBloque = () => {
    if (!nuevoBloque.hora_inicio || !nuevoBloque.hora_fin) {
      Alert.alert("Error", "Debes ingresar una hora de inicio y fin.");
      return;
    }
    setBloques([...bloques, nuevoBloque]);
    setNuevoBloque({ hora_inicio: "", hora_fin: "" });
  };

  const handleEliminarBloque = (index) => {
    const nuevosBloques = bloques.filter((_, i) => i !== index);
    setBloques(nuevosBloques);
  };

  const handleGuardar = async () => {
    if (!selectedDia) {
      Alert.alert("Error", "Debes seleccionar un día.");
      return;
    }
    try {
      if (horarioId) {
        console.log("Actualizando bloques:");
        console.log("Data enviada:", { trabajadorId, selectedDia, bloques });
        await horarioService.updateBloquesByDia(trabajadorId, selectedDia, bloques);
      } else {
        await horarioService.createHorario({ trabajador: trabajadorId, dia: selectedDia, bloques });
      }
      Alert.alert("Éxito", "Horario guardado correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al guardar el horario.");
    }
  };

  return (
    <FlatList
      data={bloques}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.title}>
            {horarioId ? `Editar Horario para ${dia}` : "Crear Nuevo Horario"}
          </Text>

          {!horarioId && (
            <>
              <Text style={styles.subtitle}>Selecciona un día disponible:</Text>
              <View style={styles.diasContainer}>
                {diasDisponibles.map((diaDisponible, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.diaButton,
                      selectedDia === diaDisponible && styles.diaButtonSelected,
                    ]}
                    onPress={() => setSelectedDia(diaDisponible)}
                  >
                    <Text
                      style={[
                        styles.diaButtonText,
                        selectedDia === diaDisponible && styles.diaButtonTextSelected,
                      ]}
                    >
                      {diaDisponible}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      }
      renderItem={({ item, index }) => (
        <View style={styles.bloqueContainer}>
          <Text>{item.hora_inicio} - {item.hora_fin}</Text>
          <TouchableOpacity onPress={() => handleEliminarBloque(index)}>
            <Text style={styles.eliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          <TextInput
            placeholder="Hora de Inicio (HH:mm)"
            value={nuevoBloque.hora_inicio}
            onChangeText={(text) => setNuevoBloque({ ...nuevoBloque, hora_inicio: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Hora de Fin (HH:mm)"
            value={nuevoBloque.hora_fin}
            onChangeText={(text) => setNuevoBloque({ ...nuevoBloque, hora_fin: text })}
            style={styles.input}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddBloque}>
            <Text style={styles.addButtonText}>Agregar Bloque</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
            <Text style={styles.saveButtonText}>Guardar Horario</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};


const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
    subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#555" },
    diasContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
    diaButton: {
      backgroundColor: "#e0e0e0",
      padding: 10,
      margin: 5,
      borderRadius: 8,
    },
    diaButtonSelected: {
      backgroundColor: "#007bff",
    },
    diaButtonText: { color: "#333" },
    diaButtonTextSelected: { color: "white", fontWeight: "bold" },
    bloqueContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 15,
      backgroundColor: "#fff",
      borderRadius: 8,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    eliminar: { color: "red", fontWeight: "bold" },
    input: {
      borderWidth: 1,
      padding: 10,
      marginBottom: 10,
      borderRadius: 8,
      borderColor: "#ccc",
      backgroundColor: "#fff",
    },
    addButton: {
      backgroundColor: "#007bff",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
    },
    addButtonText: { color: "white", fontWeight: "bold" },
    saveButton: {
      backgroundColor: "#28a745",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonText: { color: "white", fontWeight: "bold" },
  });
  

export default EditarHorarioScreen;
