import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  TextInput, 
  TouchableOpacity 
} from 'react-native'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../context/auth.context';
import { getClienteById, changePassword } from '../services/user.service';
import { useTheme } from '../context/theme.context';

export default function PerfilClienteScreen () {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();

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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (!dataCliente) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.error, { color: theme.text }]}>
          No se pudo cargar la información del cliente.
        </Text>
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Perfil del Cliente</Text>
      <View style={[styles.infoContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444", }]}>
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Nombre: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataCliente.data.nombre || 'Sin nombre'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Apellido: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataCliente.data.apellido || 'Sin apellido'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Teléfono: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataCliente.data.telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="envelope" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Email: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataCliente.data.email || 'Sin email'}</Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.background === "#F8F9FA" ? "#fff" : "#444" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Cambiar Contraseña</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#F8F9FA" ? "#CED4DA" : "#777" }]}
              placeholder="Contraseña Actual"
              secureTextEntry={true}
              value={passwordActual}
              onChangeText={setPasswordActual}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.text}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#F8F9FA" ? "#CED4DA" : "#777" }]}
              placeholder="Nueva Contraseña"
              secureTextEntry={true}
              value={passwordNuevo}
              onChangeText={setPasswordNuevo}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.text}
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
    backgroundColor: '#F8F9FA', // se sobreescribe con el theme
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
    backgroundColor: '#fff', // se sobreescribe con el theme
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
    backgroundColor: '#fff', // se sobreescribe con el theme
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

