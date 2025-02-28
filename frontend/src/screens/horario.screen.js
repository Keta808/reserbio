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

const HorarioScreen = ({ navigation }) => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  // Estado para mostrar la ayuda
  const [helpVisible, setHelpVisible] = useState(false);

  // Función para obtener horarios según el trabajador
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
    setModalTitle(title);
    setModalMessage(message);
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
      dia: '',
      bloquesExistentes: [],
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await horarioService.deleteHorarioById(deleteId);
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

  useFocusEffect(
    useCallback(() => {
      fetchHorarios();
    }, [])
  );

  // Objeto de orden para los días en español
  const dayOrder = {
    lunes: 1,
    martes: 2,
    miércoles: 3,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    sabado: 6,
    domingo: 7,
  };

  // Ordena los horarios según el día (lunes primero, etc.)
  const sortedHorarios = [...horarios].sort((a, b) => {
    const dayA = a.dia.toLowerCase();
    const dayB = b.dia.toLowerCase();
    return (dayOrder[dayA] || 0) - (dayOrder[dayB] || 0);
  });

  // Componente para mostrar si no hay horarios
  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Crea tu primer horario</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con título y botón de ayuda */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mis Horarios</Text>
        <TouchableOpacity onPress={() => setHelpVisible(true)} style={styles.helpButton}>
          <Icon name="help-circle-outline" size={28} color="#007bff" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={sortedHorarios}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.dayText}>
                  {item.dia.charAt(0).toUpperCase() + item.dia.slice(1)}
                </Text>
                {item.bloques && item.bloques.length > 0 ? (
                  item.bloques.map((bloque, index) => (
                    <Text key={index} style={styles.blockText}>
                      {bloque.hora_inicio} - {bloque.hora_fin}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.emptyBlockText}>Sin bloques registrados</Text>
                )}
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
                  <Icon name="pencil" size={24} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => showModal('Eliminar Horario', '¿Deseas eliminar este horario?', item._id)}>
                  <Icon name="trash" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Añadir Nuevo Horario</Text>
      </TouchableOpacity>

      {/* Modal de ayuda */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Cómo crear tus horarios?</Text>
            <Text style={styles.modalMessage}>
              Para crear tus horarios, presiona el botón "Añadir Nuevo Horario". En la pantalla de edición, podrás seleccionar el día y definir los bloques de tiempo.
              {"\n"}
              Si desea editar un horario existente, presione el botón de lápiz. Para eliminar un horario, presione el botón de basura.
              {"\n"}
              {"\n"}
              
            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setHelpVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación y eliminación */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  helpButton: {
    padding: 5,
  },
  listContent: {
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  dayText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  blockText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    marginTop: 5,
  },
  emptyBlockText: {
    fontSize: 16,
    color: '#dc3545',
    marginLeft: 10,
    marginTop: 5,
    fontStyle: 'italic',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 50,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Estilos para pantalla completa sin días disponibles
  emptyDiasContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f0f2f5',
  },
  emptyDiasTextFull: {
    fontSize: 22,
    color: '#e74c3c',
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
});

export default HorarioScreen;
