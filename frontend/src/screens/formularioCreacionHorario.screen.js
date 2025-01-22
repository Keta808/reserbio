import React, { useState, useEffect, memo } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
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

const DayButton = memo(({ day, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.dayButton, selected && styles.dayButtonSelected]}
    onPress={onPress}
  >
    <Text style={styles.dayButtonText}>{day}</Text>
  </TouchableOpacity>
));

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
          const availableDays = response?.availableDays?.[0] || []; // Manejar valores nulos
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
    setFormData({ ...formData, [key]: value });
  };

  const handleExceptionChange = (key, value) => {
    setNewException({ ...newException, [key]: value });
  };

  const addException = () => {
    if (!newException.inicio_no_disponible || !newException.fin_no_disponible) {
      Alert.alert('Error', 'Debe completar ambos campos para agregar una excepción.');
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
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo guardar la disponibilidad.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {disponibilidad ? 'Editar Disponibilidad' : 'Crear Disponibilidad'}
      </Text>

        {!disponibilidad && loading ? (
            <Text style={styles.loadingText}>Cargando días disponibles...</Text>
             ) : !disponibilidad && availableDays.length > 0 ? (
            <FlatList
              data={availableDays}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <DayButton
                  day={item}
                  selected={formData.dia === item}
                  onPress={() => handleChange('dia', item)}
                />
              )}
              numColumns={3} // Distribuir los elementos en columnas
              contentContainerStyle={styles.flatListContainer}
            />
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Hora Inicio (HH:MM)"
        value={formData.hora_inicio}
        onChangeText={(value) => handleChange('hora_inicio', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Hora Fin (HH:MM)"
        value={formData.hora_fin}
        onChangeText={(value) => handleChange('hora_fin', value)}
      />

      <Text style={styles.subTitle}>Excepciones</Text>
      {formData.excepciones.map((excepcion, index) => (
        <View key={index} style={styles.exceptionContainer}>
          <Text style={styles.exceptionText}>
            {excepcion.inicio_no_disponible} - {excepcion.fin_no_disponible}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeException(index)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TextInput
        style={styles.input}
        placeholder="Inicio no disponible (HH:MM)"
        value={newException.inicio_no_disponible}
        onChangeText={(value) => handleExceptionChange('inicio_no_disponible', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Fin no disponible (HH:MM)"
        value={newException.fin_no_disponible}
        onChangeText={(value) => handleExceptionChange('fin_no_disponible', value)}
      />

      <TouchableOpacity style={styles.addButton} onPress={addException}>
        <Text style={styles.buttonText}>Agregar Excepción</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  dayButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  dayButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  exceptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exceptionText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FormularioCreacionHorasScreen;
