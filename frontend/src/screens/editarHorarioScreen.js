import React, { useState, useEffect } from "react";
import { SafeAreaView, FlatList, View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, Alert, Modal, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from "@react-navigation/native";
import horarioService from "../services/horario.service";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EditarHorarioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { horarioId, trabajadorId, dia, bloquesExistentes = [] } = route.params;

  const [bloques, setBloques] = useState(bloquesExistentes);
  const [nuevoBloque, setNuevoBloque] = useState({ hora_inicio: '', hora_fin: '' });
  const [showPicker, setShowPicker] = useState({ visible: false, field: '' });
  const [pickerTime, setPickerTime] = useState(new Date());
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
      setDiasDisponibles(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron obtener los días disponibles.");
    }
  };

  // Convierte una hora "HH:mm" a minutos para comparación
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Fusiona el nuevo bloque con los bloques existentes que se solapen
  const mergeNewBlock = (newBlock, existingBlocks) => {
    const newStart = timeToMinutes(newBlock.hora_inicio);
    const newEnd = timeToMinutes(newBlock.hora_fin);
    let mergedStart = newStart;
    let mergedEnd = newEnd;
    let nonOverlapping = [];
    
    existingBlocks.forEach(bloque => {
      const bStart = timeToMinutes(bloque.hora_inicio);
      const bEnd = timeToMinutes(bloque.hora_fin);
      // Si se solapan: el nuevo bloque tiene alguna intersección con el bloque existente
      if ((newStart < bEnd) && (newEnd > bStart)) {
        mergedStart = Math.min(mergedStart, bStart);
        mergedEnd = Math.max(mergedEnd, bEnd);
      } else {
        nonOverlapping.push(bloque);
      }
    });
    const mergedBlock = {
      hora_inicio: `${Math.floor(mergedStart / 60).toString().padStart(2, '0')}:${(mergedStart % 60).toString().padStart(2, '0')}`,
      hora_fin: `${Math.floor(mergedEnd / 60).toString().padStart(2, '0')}:${(mergedEnd % 60).toString().padStart(2, '0')}`
    };
    return [...nonOverlapping, mergedBlock].sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));
  };

  const handleAddBloque = () => {
    if (!nuevoBloque.hora_inicio || !nuevoBloque.hora_fin) {
      Alert.alert("Error", "Debes ingresar una hora de inicio y fin.");
      return;
    }
    if (timeToMinutes(nuevoBloque.hora_inicio) >= timeToMinutes(nuevoBloque.hora_fin)) {
      Alert.alert("Error", "La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
    // Fusiona el nuevo bloque con los existentes si se solapan
    const nuevosBloques = mergeNewBlock(nuevoBloque, bloques);
    setBloques(nuevosBloques);
    setNuevoBloque({ hora_inicio: '', hora_fin: '' });
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

  // Muestra el picker. Se usa el valor previo si existe, o 08:00 por defecto.
  const showTimePickerFunc = (field) => {
    setShowPicker({ visible: true, field });
    if (nuevoBloque[field]) {
      const [h, m] = nuevoBloque[field].split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      setPickerTime(d);
    } else {
      const d = new Date();
      d.setHours(8, 0, 0, 0);
      setPickerTime(d);
    }
  };

  // Para iOS se usa un modal con confirmación
  const handleTimeChangeIOS = (event, selectedDate) => {
    if (selectedDate) {
      setPickerTime(selectedDate);
    }
  };

  // En Android se usa el picker nativo inline sin modal; se actualiza el valor directamente
  const handleTimeChangeAndroid = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setPickerTime(selectedDate);
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setNuevoBloque({ ...nuevoBloque, [showPicker.field]: formattedTime });
      setShowPicker({ visible: false, field: '' });
    } else {
      setShowPicker({ visible: false, field: '' });
    }
  };

  // En iOS se confirma manualmente con el botón
  const confirmTimeIOS = () => {
    const hours = pickerTime.getHours();
    const minutes = pickerTime.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setNuevoBloque({ ...nuevoBloque, [showPicker.field]: formattedTime });
    setShowPicker({ visible: false, field: '' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 120 }}
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
                        selectedDia === diaDisponible && styles.diaButtonSelected
                      ]}
                      onPress={() => setSelectedDia(diaDisponible)}
                    >
                      <Text
                        style={[
                          styles.diaButtonText,
                          selectedDia === diaDisponible && styles.diaButtonTextSelected
                        ]}
                      >
                        {diaDisponible.charAt(0).toUpperCase() +
                          diaDisponible.slice(1)}
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
            <Text style={styles.bloqueText}>
              {item.hora_inicio} - {item.hora_fin}
            </Text>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                handleEliminarBloque(index);
              }}
            >
              <Text style={styles.eliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => showTimePickerFunc('hora_inicio')}
              style={styles.input}
            >
              <Text style={styles.inputText}>
                {nuevoBloque.hora_inicio || "Hora de Inicio (HH:mm)"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showTimePickerFunc('hora_fin')}
              style={styles.input}
            >
              <Text style={styles.inputText}>
                {nuevoBloque.hora_fin || "Hora de Fin (HH:mm)"}
              </Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && showPicker.visible && (
              <Modal visible={showPicker.visible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <DateTimePicker
                      mode="time"
                      value={pickerTime}
                      is24Hour={true}
                      themeVariant="light"
                      display="spinner"
                      onChange={handleTimeChangeIOS}
                    />
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={confirmTimeIOS}
                    >
                      <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
            {Platform.OS === 'android' && showPicker.visible && (
              <DateTimePicker
                mode="time"
                value={pickerTime}
                is24Hour={true}
                themeVariant="light"
                display="spinner"
                onChange={handleTimeChangeAndroid}
              />
            )}
            <TouchableOpacity style={styles.addButton} onPress={handleAddBloque}>
              <Text style={styles.addButtonText}>Agregar Bloque</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar Horario</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff', 
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  container: { 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 30, 
    fontWeight: '700', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#222' 
  },
  subtitle: { 
    fontSize: 18, 
    marginBottom: 15, 
    color: '#555' 
  },
  diasContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginBottom: 15 
  },
  diaButton: { 
    backgroundColor: '#e8e8e8', 
    padding: 10, 
    margin: 6, 
    borderRadius: 10 
  },
  diaButtonSelected: { 
    backgroundColor: '#3498db' 
  },
  diaButtonText: { 
    color: '#333', 
    fontSize: 16 
  },
  diaButtonTextSelected: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  bloqueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bloqueText: { 
    fontSize: 16, 
    color: '#444' 
  },
  eliminar: { 
    color: '#e74c3c', 
    fontWeight: 'bold' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  inputText: {
    color: '#333',
    fontSize: 16,
  },
  addButton: { 
    backgroundColor: '#3498db', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  addButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  saveButtonContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 15, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderColor: '#ddd' 
  },
  saveButton: { 
    backgroundColor: '#27ae60', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  confirmButton: { 
    backgroundColor: '#27ae60', 
    padding: 10, 
    borderRadius: 8, 
    marginTop: 10 
  },
  confirmButtonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
});

export default EditarHorarioScreen;
