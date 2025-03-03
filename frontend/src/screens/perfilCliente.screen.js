import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity } from 'react-native'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../context/auth.context';
import { getClienteById, changePassword } from '../services/user.service';

export default function PerfilClienteScreen () {
  const { user } = useContext(AuthContext);
  const [dataCliente, setDataCliente] = useState(null);
  const [loading, setLoading] = useState(true);   
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para el cambio de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        if (!user || !user.id) return; 
        const clienteData = await getClienteById(user.id);
        setDataCliente(clienteData);
      } catch (error) {
        console.error("Error al cargar datos del cliente:", error);
        Alert.alert("Error", "No se pudo cargar la información del cliente");
      } finally {
        setLoading(false);
      }
    }; 
    fetchClienteData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!dataCliente) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No se pudo cargar la información del cliente.</Text>
      </View>
    );
  } 

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setPasswordActual('');
    setPasswordNuevo('');
  };

  const handleChangePassword = async () => {
    if (!passwordActual || !passwordNuevo) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    try {
      await changePassword({ 
        id: user.id, 
        oldPassword: passwordActual, 
        newPassword: passwordNuevo 
      });
      Alert.alert("Éxito", "Contraseña cambiada correctamente.");
      handleCloseModal();
    } catch (error) {
      Alert.alert("Error", "No se pudo cambiar la contraseña.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil del Cliente</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={styles.label}>Nombre: </Text>
          <Text style={styles.value}>{dataCliente.data.nombre || 'Sin nombre'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={styles.label}>Apellido: </Text>
          <Text style={styles.value}>{dataCliente.data.apellido || 'Sin apellido'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={styles.label}>Teléfono: </Text>
          <Text style={styles.value}>{dataCliente.data.telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="envelope" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={styles.label}>Email: </Text>
          <Text style={styles.value}>{dataCliente.data.email || 'Sin email'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.changePasswordButton} onPress={handleOpenModal}>
        <Icon name="lock" size={20} color="#fff" />
        <Text style={styles.changePasswordButtonText}> Cambiar Contraseña</Text>
      </TouchableOpacity>

      <Modal 
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            <TextInput
                style={styles.input}
                placeholder="Contraseña Actual"
                secureTextEntry={true}
                value={passwordActual}
                onChangeText={setPasswordActual}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Nueva Contraseña"
                secureTextEntry={true}
                value={passwordNuevo}
                onChangeText={setPasswordNuevo}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCloseModal}>
                <Icon name="times" size={18} color="#fff" />
                <Text style={styles.buttonText}> Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleChangePassword}>
                <Icon name="check" size={18} color="#fff" />
                <Text style={styles.buttonText}> Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  }, 
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center', 
    color: '#343A40',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#495057',
  },
  value: {
    fontSize: 16,
    color: '#6C757D',
  },
  changePasswordButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#343A40',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#CED4DA',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#495057',
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  saveButton: {
    backgroundColor: '#28A745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

