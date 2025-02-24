import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import horarioService from '../services/horario.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtener ID del usuario
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

const HorarioScreen = ({ navigation }) => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [modalTitle, setModalTitle] = useState('');


  // Obtener horarios por trabajador
  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      if (userId) {
        const response = await horarioService.getHorarioByTrabajadorId(userId);
        if (response.state === 'Success' && Array.isArray(response.data)) {
          setHorarios(response.data);
        } else {
          showModal('Error', 'No se pudo obtener los horarios correctamente.');
        }
      } else {
        showModal('Error', 'No se pudo obtener el ID del trabajador.');
      }
    } catch (error) {
      console.error(error);
      showModal('Error', 'No se pudo cargar la lista de horarios.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (title, message, id = null) => {
    setModalMessage(`${title}: ${message}`);
    setDeleteId(id);
    setModalVisible(true);
  };

  const handleEdit = (horario) => {
    navigation.navigate('EditarHorario', {
      horarioId: horario._id,
      trabajadorId: horario.trabajador,
      dia: horario.dia,
      bloquesExistentes: horario.bloques,
    });
  };
  
  // Navegar para crear un nuevo horario
  const handleCreate = async () => {
    const userId = await getUserId();
    navigation.navigate('EditarHorario', {
      horarioId: null,
      trabajadorId: userId,
      dia: '', // Aquí puedes permitir seleccionar el día en la pantalla de edición si lo deseas
      bloquesExistentes: [],
    });
  };
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await horarioService.deleteHorario(deleteId);
      if (response.state === 'Success') {
        showModal('Éxito', 'Horario eliminado correctamente.');
        fetchHorarios();
      } else {
        showModal('Error', 'No se pudo eliminar el horario.');
      }
    } catch (error) {
      console.error(error);
      showModal('Error', 'No se pudo eliminar el horario.');
    } finally {
      setModalVisible(false);
    }
  };

  const renderHorario = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>
          Día: {item.dia} - {item.hora_inicio} a {item.hora_fin}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
          <Icon name="pencil" size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => showModal('Eliminar Horario', '¿Deseas eliminar este horario?', item._id)}
        >
          <Icon name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      fetchHorarios();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={horarios}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemContent}>
              <Text style={styles.itemText}>
                Día: {item.dia}
              </Text>
              {item.bloques && item.bloques.length > 0 ? (
                item.bloques.map((bloque, index) => (
                  <Text key={index} style={styles.bloqueText}>
                    Bloque {index + 1}: {bloque.hora_inicio} - {bloque.hora_fin}
                  </Text>
                ))
              ) : (
                <Text style={styles.emptyBloquesText}>Sin bloques registrados</Text>
              )}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
                <Icon name="pencil" size={20} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => showModal('Eliminar Horario', '¿Deseas eliminar este horario?', item._id)}
              >
                <Icon name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
  
      {/* ✅ Botón para crear un nuevo horario */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Añadir Nuevo Horario</Text>
      </TouchableOpacity>
  
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleDelete(selectedHorarioId)}>
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
  
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    width: '70%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    width: '85%',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  modalText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDeleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bloqueText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    marginTop: 5,
  },
  emptyBloquesText: {
    fontSize: 16,
    color: '#dc3545',
    marginLeft: 10,
    marginTop: 5,
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20, // Añade espacio alrededor
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  
});

export default HorarioScreen;
