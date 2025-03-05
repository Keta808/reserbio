import React, { useState, useEffect } from "react";
import { 
  SafeAreaView, 
  FlatList, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  LayoutAnimation, 
  Platform, 
  UIManager, 
  Modal, 
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from "@react-navigation/native";
import horarioService from "../services/horario.service";
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../context/theme.context";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EditarHorarioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { horarioId, trabajadorId, dia, bloquesExistentes = [] } = route.params;
  const { theme } = useTheme();

  const [bloques, setBloques] = useState(bloquesExistentes);
  const [nuevoBloque, setNuevoBloque] = useState({ hora_inicio: '', hora_fin: '' });
  const [showPicker, setShowPicker] = useState({ visible: false, field: '' });
  const [pickerTime, setPickerTime] = useState(new Date());
  const [diasDisponibles, setDiasDisponibles] = useState([]);
  const [selectedDia, setSelectedDia] = useState(dia || null);
  const [loading, setLoading] = useState(!horarioId); // Si no se edita, se inicia en loading

  // Estado para mostrar la ayuda
  const [helpVisible, setHelpVisible] = useState(false);

  // Estados para el modal de error
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Función para mostrar errores en el modal
  const showError = (msg) => {
    setErrorMessage(msg);
    setErrorModalVisible(true);
  };

  useEffect(() => {
    if (!horarioId) {
      fetchDiasDisponibles();
    }
  }, []);

  const fetchDiasDisponibles = async () => {
    setLoading(true);
    try {
      const response = await horarioService.getDiasSinHorario(trabajadorId);
      setDiasDisponibles(response.data);
    } catch (error) {
      console.error(error);
      showError("No se pudieron obtener los días disponibles.");
    }
    setLoading(false);
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
      showError("Debes ingresar una hora de inicio y fin.");
      return;
    }
    if (timeToMinutes(nuevoBloque.hora_inicio) >= timeToMinutes(nuevoBloque.hora_fin)) {
      showError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
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
      showError("Debes seleccionar un día.");
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
      let errMsg = "Hubo un problema al guardar el horario.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errMsg = error.response.data.message;
      } else if (error.message) {
        errMsg = error.message;
      }
      showError(errMsg);
    }
  };

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

  const handleTimeChangeIOS = (event, selectedDate) => {
    if (selectedDate) {
      setPickerTime(selectedDate);
    }
  };

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

  const confirmTimeIOS = () => {
    const hours = pickerTime.getHours();
    const minutes = pickerTime.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setNuevoBloque({ ...nuevoBloque, [showPicker.field]: formattedTime });
    setShowPicker({ visible: false, field: '' });
  };

  // Si no se está editando y se está cargando los días, muestra una pantalla de loading
  if (!horarioId && loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si no se está editando y no hay días disponibles, muestra una pantalla completa
  if (!horarioId && diasDisponibles.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.emptyDiasContainerFull}>
          <Text style={[styles.emptyDiasTextFull, { color: theme.text }]}>
            No hay días disponibles para crear.
          </Text>
          <Text style={[styles.emptyDiasTextFull, { color: theme.text }]}>
            Si deseas editar los horarios, puedes hacerlo en la pantalla "Horarios".
          </Text>
          <TouchableOpacity style={styles.editHorariosButton} onPress={() => navigation.goBack()}>
            <Text style={styles.editHorariosButtonText}>Ir a Horarios</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header con botón de volver atrás, título y ayuda */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
            <Icon name="arrow-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {horarioId ? `Editar Horario para ${dia}` : "Crear Nuevo Horario"}
          </Text>
          <TouchableOpacity onPress={() => setHelpVisible(true)} style={styles.helpButton}>
            <Icon name="help-circle-outline" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Si no se edita un horario, se muestran los días disponibles */}
        {!horarioId && (
          <>
            <Text style={[styles.subtitle, { color: theme.text }]}>Selecciona un día disponible:</Text>
            <View style={styles.diasContainer}>
              {diasDisponibles.map((diaDisponible, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.diaButton,
                    {
                      backgroundColor: selectedDia === diaDisponible
                        ? (theme.background === "#FFFFFF" ? "#3498db" : "#1e90ff")
                        : (theme.background === "#FFFFFF" ? "#e8e8e8" : "#555")
                    }
                  ]}
                  onPress={() => setSelectedDia(diaDisponible)}
                >
                  <Text
                    style={[
                      styles.diaButtonText,
                      { color: theme.text },
                      selectedDia === diaDisponible && styles.diaButtonTextSelected
                    ]}
                  >
                    {diaDisponible.charAt(0).toUpperCase() + diaDisponible.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <FlatList
          contentContainerStyle={{ paddingBottom: 120 }}
          data={bloques}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.bloqueContainer, { backgroundColor: theme.background === "#FFFFFF" ? '#fff' : '#333' }]}>
              <Text style={[styles.bloqueText, { color: theme.text }]}>
                {item.hora_inicio} - {item.hora_fin}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
                style={[
                  styles.input,
                  { backgroundColor: theme.background === "#FFFFFF" ? '#fff' : '#444' }
                ]}
              >
                <Text style={[styles.inputText, { color: theme.text }]}>
                  {nuevoBloque.hora_inicio || "Hora de Inicio (HH:mm)"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => showTimePickerFunc('hora_fin')}
                style={[
                  styles.input,
                  { backgroundColor: theme.background === "#FFFFFF" ? '#fff' : '#444' }
                ]}
              >
                <Text style={[styles.inputText, { color: theme.text }]}>
                  {nuevoBloque.hora_fin || "Hora de Fin (HH:mm)"}
                </Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' && showPicker.visible && (
                <Modal visible={showPicker.visible} transparent={true} animationType="slide">
                  <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
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
      </View>

      <View style={[styles.saveButtonContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar Horario</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Ayuda */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Cómo funcionan los bloques?</Text>
            <Text style={[styles.modalMessage, { color: theme.text }]}>
              Los bloques representan intervalos de tiempo que conforman tu horario.{"\n\n"}
              - Para agregarlos, presiona "Agregar Bloque" luego de seleccionar la hora de inicio y de fin.{"\n"}
              - Si se solapan, se fusionarán automáticamente en un solo bloque.{"\n"}
              - Para eliminar un bloque, presiona "Eliminar" junto a él.
            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setHelpVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para mostrar errores */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.errorModalOverlay} 
          activeOpacity={1} 
          onPress={() => setErrorModalVisible(false)}
        >
          <View style={[styles.errorModalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
            <Text style={[styles.errorModalTitle, { color: theme.text }]}>Error</Text>
            <Text style={[styles.errorModalMessage, { color: theme.text }]}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.errorModalButton} 
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.errorModalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff', 
  },
  container: { 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonHeader: {
    padding: 5,
    marginRight: 10,
  },
  title: { 
    fontSize: 30, 
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#222',
    flex: 1,
  },
  helpButton: {
    padding: 5,
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
    padding: 10, 
    margin: 6, 
    borderRadius: 10 
  },
  diaButtonText: { 
    fontSize: 16, 
  },
  diaButtonTextSelected: { 
    fontWeight: '600' 
  },
  emptyDiasContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyDiasTextFull: {
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
  },
  editHorariosButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  editHorariosButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bloqueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  inputText: {
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
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    padding: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorModalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e74c3c'
  },
  errorModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  errorModalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  errorModalButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  // Se pueden agregar más estilos o modificarlos según el theme
});

export default EditarHorarioScreen;
