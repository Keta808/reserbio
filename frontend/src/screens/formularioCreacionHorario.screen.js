import React, { useState, useEffect, memo } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import disponibilidadService from '../services/disponibilidad.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserId = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.id;
    } else {
      console.error('No se encontraron datos de usuario en AsyncStorage');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener datos de AsyncStorage:', error);
    return null;
  }
};

const parseTime = (timeStr) => {
  const [hh, mm] = timeStr.split(':');
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
};


const generateTimeOptions = () => {
  const times = [{ label: 'Seleccionar Hora', value: '', enabled: false }];
  for (let hour = 8; hour <= 24; hour++) {
    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
    times.push({ label: `${formattedHour}:00`, value: `${formattedHour}:00` });
    times.push({ label: `${formattedHour}:30`, value: `${formattedHour}:30` });
  }
  return times;
};

const timeOptions = generateTimeOptions();

const FormularioCreacionHorasScreen = ({ route, navigation }) => {
  const { disponibilidad } = route.params || {};

  const [formData, setFormData] = useState({
    dia: disponibilidad?.dia || '',
    hora_inicio: disponibilidad?.hora_inicio || '',
    hora_fin: disponibilidad?.hora_fin || '',
    trabajador: '',
    excepciones: disponibilidad?.excepciones || [],
  });

  const [newException, setNewException] = useState({
    inicio_no_disponible: '',
    fin_no_disponible: '',
  });

  const [showExceptionPickers, setShowExceptionPickers] = useState(false);

  const [availableDays, setAvailableDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [iosPickerKey, setIosPickerKey] = useState('');
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const userId = await getUserId();

      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID del usuario.');
        setLoading(false);
        return;
      }

      setFormData((prevFormData) => ({ ...prevFormData, trabajador: userId }));

      if (!disponibilidad) {
        try {
          const response = await disponibilidadService.getDiasSinHorario(userId);
          const availableDays = response?.availableDays?.[0] || [];
          if (availableDays.length === 0) {
            Alert.alert('Advertencia', 'No hay días disponibles.');
            setAvailableDays([]);
          } else {
            setAvailableDays(availableDays);
          }
        } catch (error) {
          console.error('Error al obtener días sin horario:', error);
          Alert.alert('Error', 'No se pudieron cargar los días disponibles.');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [disponibilidad]);

  const handleChange = (key, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [key]: value }));
  };


  const confirmIosPicker = () => {
    if (iosPickerKey === 'inicio_no_disponible' || iosPickerKey === 'fin_no_disponible') {
      // Si es una excepción, actualizar newException
      setNewException((prev) => ({
        ...prev,
        [iosPickerKey]: tempValue,
      }));
      console.log(`Excepción actualizada: ${iosPickerKey} = ${tempValue}`);
    } else {
      // Si no es una excepción, actualizar formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        [iosPickerKey]: tempValue,
      }));
      console.log(`Disponibilidad actualizada: ${iosPickerKey} = ${tempValue}`);
    }
  
    setIosPickerVisible(false);
  };
  
  
  useEffect(() => {
    console.log("Estado de newException actualizado:", newException);
  }, [newException]);


  const cancelIosPicker = () => {
    setTempValue('');
    setIosPickerVisible(false);
  };

  const addException = () => {
    if (!newException.inicio_no_disponible || !newException.fin_no_disponible) {
      Alert.alert('Error', 'Debe completar ambos campos para agregar una excepción.');
      return;
    }
  
    if (parseTime(newException.fin_no_disponible) <= parseTime(newException.inicio_no_disponible)) {
      Alert.alert(
        'Error',
        'La hora de fin de la excepción debe ser mayor que la hora de inicio.'
      );
      return;
    }
  
    setFormData((prevFormData) => {
      const updatedExceptions = [...prevFormData.excepciones, { ...newException }];
      console.log("Nuevas excepciones:", updatedExceptions); // Verifica que las excepciones se están agregando
      return {
        ...prevFormData,
        excepciones: updatedExceptions,
      };
    });
  
    setNewException({ inicio_no_disponible: '', fin_no_disponible: '' });
  };

  const removeException = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      excepciones: prevFormData.excepciones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.dia || !formData.hora_inicio || !formData.hora_fin) {
        Alert.alert('Error', 'Debe completar todos los campos obligatorios.');
        return;
      }
  
      if (parseTime(formData.hora_fin) <= parseTime(formData.hora_inicio)) {
        Alert.alert('Error', 'La hora de fin debe ser mayor que la hora de inicio.');
        return;
      }
  
      const cleanedFormData = {
        ...formData,
        excepciones: formData.excepciones || [],
      };
  
      console.log("🟢 Datos que se enviarán a la API:", JSON.stringify(cleanedFormData, null, 2));
  
      if (!cleanedFormData.trabajador) {
        Alert.alert('Error', 'No se encontró el ID del trabajador.');
        return;
      }
  
      let response;
      if (disponibilidad) {
        response = await disponibilidadService.updateDisponibilidad(disponibilidad._id, cleanedFormData);
        Alert.alert('Éxito', 'Disponibilidad actualizada');
      } else {
        response = await disponibilidadService.createDisponibilidad(cleanedFormData);
        Alert.alert('Éxito', 'Disponibilidad creada');
      }
  
      console.log("✅ Respuesta de la API:", response.data);
  
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error al guardar la disponibilidad:', error.response?.data || error);
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo guardar la disponibilidad.');
    }
  };
  

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>
        {disponibilidad ? 'Editar Disponibilidad' : 'Crear Disponibilidad'}
      </Text>

      {loading ? (
        <Text style={styles.loadingText}>Cargando días disponibles...</Text>
      ) : (
        <View style={styles.dayButtonContainer}>
          {availableDays.map((item, index) => (
            <TouchableOpacity
              key={index.toString()}
              style={[
                styles.dayButton,
                formData.dia === item && styles.dayButtonSelected,
              ]}
              onPress={() => handleChange('dia', item)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  formData.dia === item && styles.dayButtonTextSelected,
                ]}
              >
                {capitalizeFirstLetter(item)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Botones para abrir modales */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => {
          setIosPickerKey('hora_inicio');
          setTempValue(formData.hora_inicio);
          setIosPickerVisible(true);
        }}
      >
        <Text style={styles.pickerButtonText}>
          {formData.hora_inicio || 'Seleccionar Hora Inicio'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => {
          setIosPickerKey('hora_fin');
          setTempValue(formData.hora_fin);
          setIosPickerVisible(true);
        }}
      >
        <Text style={styles.pickerButtonText}>
          {formData.hora_fin || 'Seleccionar Hora Fin'}
        </Text>
      </TouchableOpacity>

      {/* Botón para mostrar/ocultar pickers de excepciones */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowExceptionPickers(!showExceptionPickers)}
      >
        <Text style={styles.pickerButtonText}>
          {showExceptionPickers ? 'Ocultar Excepciones' : 'Mostrar Excepciones'}
        </Text>
      </TouchableOpacity>

      {showExceptionPickers && (
        <>
          {/* Excepciones */}
          {formData.excepciones.map((excepcion, index) => (
            <View key={index} style={styles.exceptionContainer}>
              <Text style={styles.exceptionText}>
                {excepcion.inicio_no_disponible} - {excepcion.fin_no_disponible}
              </Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => removeException(index)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={styles.exceptionTitle}>Agregar Excepción (Opcional)</Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setIosPickerKey('inicio_no_disponible');
              setTempValue(newException.inicio_no_disponible);
              setIosPickerVisible(true);
            }}
          >
            <Text style={styles.pickerButtonText}>
              {newException.inicio_no_disponible || 'Seleccionar Inicio no Disponible'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setIosPickerKey('fin_no_disponible');
              setTempValue(newException.fin_no_disponible);
              setIosPickerVisible(true);
            }}
          >
            <Text style={styles.pickerButtonText}>
              {newException.fin_no_disponible || 'Seleccionar Fin no Disponible'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={addException}>
            <Text style={styles.buttonText}>Agregar Excepción</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para iOS y Android */}
      <Modal visible={iosPickerVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={tempValue}
              onValueChange={(itemValue) => setTempValue(itemValue)}
            >
              {timeOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={Platform.OS === 'ios' ? '#000000' : undefined}
                />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  cancelIosPicker();
                  if (Platform.OS === 'android') {
                    setIosPickerVisible(false);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  confirmIosPicker();
                  if (Platform.OS === 'android') {
                    setIosPickerVisible(false);
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // CONTAINER
  container: {
    flex: 1,
    padding: 20,
    // Un color de fondo más claro y suave
    backgroundColor: '#F3F4F6',
  },

  // TITULOS Y TEXTOS
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: '15%',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1F2937',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: '#6B7280',
  },

  // BOTONES DE DIAS
  dayButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  dayButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  dayButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },

  // ESTILOS ESPECIFICOS PARA iOS
  iosPickerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iosPickerItem: {
    color: '#000000',
    fontSize: 18,
  },

  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exceptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  exceptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  exceptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // BOTONERA FINAL
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  submitButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // MODAL GENERAL
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FormularioCreacionHorasScreen;
