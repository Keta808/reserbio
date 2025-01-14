import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Modal,
  Button,
} from 'react-native';
import disponibilidadService from '../services/disponibilidad.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para obtener el ID del usuario
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

// Componente principal
const DisponibilidadScreen = ({ navigation }) => {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const diasOrden = {
    lunes: 1,
    martes: 2,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    domingo: 7,
  };

  const fetchDisponibilidades = async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      if (userId) {
        const response = await disponibilidadService.getDisponibilidadByTrabajadorId(userId);

        if (response.state === 'Success' && Array.isArray(response.data)) {
          const sortedDisponibilidades = response.data.sort(
            (a, b) => diasOrden[a.dia.toLowerCase()] - diasOrden[b.dia.toLowerCase()]
          );
          setDisponibilidades(sortedDisponibilidades);
        } else {
          showModal('Error', 'No se pudo obtener las disponibilidades correctamente.');
        }
      } else {
        showModal('Error', 'No se pudo obtener el ID del trabajador.');
      }
    } catch (error) {
      showModal('Error', 'No se pudo cargar la lista de disponibilidades.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (title, message, id = null) => {
    setModalMessage(`${title}: ${message}`);
    setDeleteId(id);
    setModalVisible(true);
  };

  const handleEdit = (disponibilidad) => {
    navigation.navigate('FormularioCreacionHoras', {
      disponibilidad,
      onGoBack: fetchDisponibilidades,
    });
  };

  const handleCreate = () => {
    navigation.navigate('FormularioCreacionHoras', {
      onGoBack: fetchDisponibilidades,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      console.log('Eliminando disponibilidad con ID:', deleteId);
      const response = await disponibilidadService.deleteDisponibilidad(deleteId);
      if (response.state === 'Success') {
        showModal('Éxito', 'Disponibilidad eliminada correctamente.');
        fetchDisponibilidades(); // Actualizar la lista
      } else {
        showModal('Error', 'No se pudo eliminar la disponibilidad.');
      }
    } catch (error) {
      showModal('Error', 'No se pudo eliminar la disponibilidad.');
    } finally {
      setModalVisible(false);
    }
  };

  const renderDisponibilidad = ({ item }) => (
    <ScrollView contentContainerStyle={styles.item}>
      <Text style={styles.itemText}>
        {item.dia}: {item.hora_inicio} - {item.hora_fin}
      </Text>
      {item.excepciones && item.excepciones.length > 0 ? (
        <ScrollView style={styles.excepcionesContainer}>
          <Text style={styles.excepcionesTitle}>Excepciones:</Text>
          {item.excepciones.map((excepcion, index) => (
            <Text key={index} style={styles.excepcionText}>
              - {excepcion.inicio_no_disponible} a {excepcion.fin_no_disponible}
            </Text>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noExcepcionesText}>No hay excepciones</Text>
      )}
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => showModal('Eliminar Disponibilidad', '¿Deseas eliminar esta disponibilidad?', item._id)}
      >
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  useFocusEffect(
    useCallback(() => {
      fetchDisponibilidades();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Horario por día</Text>
      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={disponibilidades}
          keyExtractor={(item) => item._id}
          renderItem={renderDisponibilidad}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay disponibilidades registradas</Text>}
        />
      )}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.buttonText}>Crear Disponibilidad</Text>
      </TouchableOpacity>

      {/* Modal personalizado */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            {deleteId && (
              <Button title="Eliminar" onPress={handleDelete} color="#dc3545" />
            )}
            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DisponibilidadScreen;
