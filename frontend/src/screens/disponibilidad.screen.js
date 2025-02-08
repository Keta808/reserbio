import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons'; 

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

const DisponibilidadScreen = ({ navigation }) => {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
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
      console.error(error);
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
    });
  };

  const handleCreate = () => {
    navigation.navigate('FormularioCreacionHoras');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await disponibilidadService.deleteDisponibilidad(deleteId);
      if (response.state === 'Success') {
        showModal('Éxito', 'Disponibilidad eliminada correctamente.');
        fetchDisponibilidades();
      } else {
        showModal('Error', 'No se pudo eliminar la disponibilidad.');
      }
    } catch (error) {
      console.error(error);
      showModal('Error', 'No se pudo eliminar la disponibilidad.');
    } finally {
      setModalVisible(false);
    }
  };

  
const renderDisponibilidad = ({ item }) => (
  <View style={styles.item}>
    <View style={styles.itemContent}>
      <Text style={styles.itemText}>
        {item.dia.charAt(0).toUpperCase() + item.dia.slice(1)}: {item.hora_inicio} - {item.hora_fin}
      </Text>
      {item.excepciones && item.excepciones.length > 0 ? (
        item.excepciones.map((excepcion, index) => (
          <Text key={index} style={styles.excepcionText}>
            {excepcion.inicio_no_disponible} a {excepcion.fin_no_disponible}
          </Text>
        ))
      ) : (
        <Text style={styles.noExcepcionesText}>No hay excepciones</Text>
      )}
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
        <Icon name="pencil" size={20} color="#007bff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() =>
          showModal('Eliminar Disponibilidad', '¿Deseas eliminar esta disponibilidad?', item._id)
        }
      >
        <Icon name="trash" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  </View>
);

  useFocusEffect(
    useCallback(() => {
      fetchDisponibilidades();
    }, [])
  );

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Horario por día</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={disponibilidades}
            keyExtractor={(item) => item._id}
            renderItem={renderDisponibilidad}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay disponibilidades registradas</Text>
            }
            contentContainerStyle={{ paddingBottom: 100 }} // Espacio adicional al final
          />
        )}

        {/* Botón flotante para crear disponibilidad */}
        <TouchableOpacity style={styles.floatingButton} onPress={handleCreate}>
          <Text style={styles.buttonText}>Crear Disponibilidad</Text>
        </TouchableOpacity>

      {/* Modal */}
          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>{modalMessage}</Text>

                {deleteId && (
                  <TouchableOpacity style={styles.modalDeleteButton} onPress={handleDelete}>
                    <Text style={styles.modalDeleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                </TouchableOpacity>
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
    backgroundColor: '#f8f9fa', // Fondo gris claro para un diseño moderno
  },

  title: {
    fontSize: 28, // Más grande para destacar el encabezado
    fontWeight: 'bold',
    color: '#007bff', // Azul para resaltar
    marginBottom: 20,
    textAlign: 'center',
  },

  //items
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 12, // Bordes redondeados
    marginBottom: 10,
    backgroundColor: '#ffffff', // Fondo blanco
    shadowColor: '#000', // Sombra para destacar
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Sombra en Android
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Texto oscuro para mayor legibilidad
    marginBottom: 5,
  },
  excepcionText: {
    fontSize: 14,
    color: '#ff6f61', // Rojo suave para destacar excepciones
    fontStyle: 'italic', // Texto en cursiva
  },
  noExcepcionesText: {
    fontSize: 14,
    color: '#999', // Texto gris claro para mostrar que no hay excepciones
  },

  //botones crear
 
 

  //botones test
  buttonContainer: {
    flexDirection: 'row', // Alinea los botones horizontalmente
    justifyContent: 'flex-end', // Alinea los botones al final del contenido
    marginTop: 10, // Espacio superior
  },
  iconButton: {
    backgroundColor: '#f8f9fa', // Fondo gris claro para destacar los iconos
    padding: 10,
    borderRadius: 50, // Bordes circulares
    marginHorizontal: 5, // Espaciado entre los iconos
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Sombra para Android
    alignItems: 'center',
    justifyContent: 'center',
  },

  //boton crear

  floatingButton: {
    position: 'absolute',
    bottom: 20, // Mantiene el botón flotando sobre el contenido
    alignSelf: 'center',
    backgroundColor: '#28a745', // Verde para el botón
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25, // Bordes redondeados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Sombra en Android
    width: '70%', // Botón ancho centrado
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  //modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff', // Fondo blanco
    width: '85%', // Ajuste óptimo para distintos dispositivos
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Sombra en Android
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDeleteButton: {
    backgroundColor: '#dc3545', // Rojo fuerte para eliminar
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
    backgroundColor: '#6c757d', // Gris neutro para cerrar
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
});


export default DisponibilidadScreen;
