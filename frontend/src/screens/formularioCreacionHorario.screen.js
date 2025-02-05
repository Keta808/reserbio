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

const DayButton = memo(({ day, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.dayButton, selected && styles.dayButtonSelected]}
    onPress={onPress}
  >
    <Text style={styles.dayButtonText}>{day}</Text>
  </TouchableOpacity>
));

const generateTimeOptions = () => {
  const times = [];
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

  const handleExceptionChange = (key, value) => {
    setNewException((prev) => ({ ...prev, [key]: value }));
  };

  const handleIosPicker = (key) => {
    setIosPickerKey(key);
    setTempValue(formData[key]);
    setIosPickerVisible(true);
  };

  const confirmIosPicker = () => {
    handleChange(iosPickerKey, tempValue);
    setIosPickerVisible(false);
  };

  const cancelIosPicker = () => {
    setTempValue('');
    setIosPickerVisible(false);
  };

  // Función única para renderizar Picker en iOS y Android con estilos custom
  const renderPicker = (key, value, placeholder, isException = false) => {
    const pickerValue = isException ? newException[key] : value;

    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            setIosPickerKey(key);
            setTempValue(pickerValue);
            setIosPickerVisible(true);
          }}
        >
          <Text style={styles.pickerButtonText}>{pickerValue || placeholder}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.androidPickerContainer}>
          <Picker
            selectedValue={pickerValue}
            onValueChange={(itemValue) => {
              if (isException) {
                handleExceptionChange(key, itemValue);
              } else {
                handleChange(key, itemValue);
              }
            }}
            style={styles.androidPicker}
            mode="dropdown" // "dialog" o "dropdown"
            itemStyle={styles.androidPickerItem}
          >
            <Picker.Item label={placeholder} value="" />
            {timeOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      );
    }
  };

  const addException = () => {
    if (!newException.inicio_no_disponible || !newException.fin_no_disponible) {
      Alert.alert('Error', 'Debe completar ambos campos para agregar una excepción.');
      return;
    }

    if (
      parseTime(newException.fin_no_disponible) <=
      parseTime(newException.inicio_no_disponible)
    ) {
      Alert.alert(
        'Error',
        'La hora de fin de la excepción debe ser mayor que la hora de inicio.'
      );
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      excepciones: [...prevFormData.excepciones, newException],
    }));
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
        Alert.alert(
          'Error',
          'La hora de fin debe ser mayor que la hora de inicio.'
        );
        return;
      }

      const cleanedFormData = {
        ...formData,
        excepciones: formData.excepciones || [],
      };

      if (!cleanedFormData.trabajador) {
        Alert.alert('Error', 'No se encontró el ID del trabajador.');
        return;
      }

      if (disponibilidad) {
        await disponibilidadService.updateDisponibilidad(disponibilidad._id, cleanedFormData);
        Alert.alert('Éxito', 'Disponibilidad actualizada');
      } else {
        await disponibilidadService.createDisponibilidad(cleanedFormData);
        Alert.alert('Éxito', 'Disponibilidad creada');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar la disponibilidad:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'No se pudo guardar la disponibilidad.'
      );
    }
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
            <DayButton
              key={index.toString()}
              day={item}
              selected={formData.dia === item}
              onPress={() => handleChange('dia', item)}
            />
          ))}
        </View>
      )}

      {renderPicker('hora_inicio', formData.hora_inicio, 'Seleccionar Hora Inicio')}
      {renderPicker('hora_fin', formData.hora_fin, 'Seleccionar Hora Fin')}

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

      {renderPicker(
        'inicio_no_disponible',
        newException.inicio_no_disponible,
        'Seleccionar Inicio no Disponible',
        true
      )}
      {renderPicker(
        'fin_no_disponible',
        newException.fin_no_disponible,
        'Seleccionar Fin no Disponible',
        true
      )}

      <TouchableOpacity style={styles.addButton} onPress={addException}>
        <Text style={styles.buttonText}>Agregar Excepción</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Picker en iOS (Modal) */}
      <Modal visible={iosPickerVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={tempValue}
              onValueChange={(itemValue) => setTempValue(itemValue)}
              itemStyle={{ color: '#000' }}
            >
              {timeOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmIosPicker}>
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={cancelIosPicker}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
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
    backgroundColor: '#fff',
  },

  // TITULOS Y TEXTOS
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    textAlign: 'center',
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },

  // BOTONES DE DIAS
  dayButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
    margin: 5,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#007bff',
  },
  dayButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },

  // PICKER (GENERAL)
  pickerButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginTop: 10,
  },
  pickerButtonText: {
    color: '#007bff',
    textAlign: 'center',
  },

  // PICKER ANDROID ESPECIFICO
  androidPickerContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  androidPicker: {
    width: '100%',
    height: 50,
    // Puedes añadir más estilos:
    // color: '#000',
    // backgroundColor: '#f9f9f9',
  },
  androidPickerItem: {
    fontSize: 16,
    color: '#333',
  },

  // EXCEPCIONES
  exceptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  exceptionText: {
    fontSize: 16,
    color: '#555',
  },
  exceptionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    padding: 5,
    alignSelf: 'center',
  },

  // BOTON AGREGAR
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
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
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  backButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },

  // MODAL IOS
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
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default FormularioCreacionHorasScreen;
