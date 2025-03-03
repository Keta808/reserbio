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
import { useNavigation } from '@react-navigation/native'; 
import { AuthContext } from '../context/auth.context';
import { getTrabajadorById, updateTrabajador } from '../services/user.service'; 
import MicroempresaServices from '../services/microempresa.service.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/theme.context';

export default function TrabajadorScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation(); 
  const { theme } = useTheme();

  const [dataTrabajador, setDataTrabajador] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [modalVisible, setModalVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  // Estados para los campos del formulario
  const [EditinguserId, setEditingUserId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [microempresa, setMicroempresa] = useState(null);

  useEffect(() => {
    const fetchMicroempresaData = async () => {
      try {
        if (!user || !user.id) return;
        const response = await MicroempresaServices.obtenerMicroempresaPorTrabajador(user.id); 
        if (response?.state === 'Success' && response.data) { 
          setMicroempresa(response.data);
        }
      } catch (error) {
        console.error("No Microempresa Data:", error.message || error);   
      } 
    }; 
    fetchMicroempresaData();
  }, []);

  useEffect(() => {
    const fetchTrabajadorData = async () => {
      try {
        if (!user || !user.id) return;
        const trabajadorData = await getTrabajadorById(user.id);
        setDataTrabajador(trabajadorData);
      } catch (error) {
        console.error("Error fetching trabajador data:", error.message || error);
        Alert.alert("Error", "No se pudo cargar la información del trabajador.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrabajadorData();
  }, [user]);
    
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ color: theme.text }}>Cargando perfil del trabajador...</Text>
      </View>
    );
  }
    
  if (!dataTrabajador) {
    return (
      <View style={styles.container}>
        <Text style={[styles.error, { color: theme.text }]}>No se pudo cargar la información del trabajador.</Text>
      </View>
    );
  }
  
  const handleEditProfile = () => { 
    setNombre(dataTrabajador.data?.nombre || '');
    setApellido(dataTrabajador.data?.apellido || '');
    setTelefono(dataTrabajador.data?.telefono || '');
    setEmail(dataTrabajador.data?.email || '');
    setEditingUserId(dataTrabajador.data?._id || null);
    setModalVisible(true);
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
  }; 

  const limpiarFormulario = () => {
    setNombre('');
    setApellido('');
    setTelefono('');
    setEmail('');
    setEditingUserId(null);
    setModalVisible(false);
  };

  const handleSaveProfile = async () => {
    try {
      const updatedData = {};
      if (nombre !== dataTrabajador.data.nombre) updatedData.nombre = nombre;
      if (apellido !== dataTrabajador.data.apellido) updatedData.apellido = apellido;
      if (telefono !== dataTrabajador.data.telefono) updatedData.telefono = telefono;
      if (email !== dataTrabajador.data.email) updatedData.email = email;

      if (Object.keys(updatedData).length === 0) {
        Alert.alert('No hay cambios', 'No has realizado modificaciones.');
        return;
      }

      const response = await updateTrabajador(EditinguserId, { trabajadorData: updatedData });
      if (response && !response[1]) {
        setDataTrabajador({ ...dataTrabajador, data: { ...dataTrabajador.data, ...updatedData } });
        limpiarFormulario();
        Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil.');
      }
    } catch (error) {
      console.error("Error updating profile:", error.message || error);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  }; 

  const handleShowInformation = () => {
    setInfoVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleShowInformation} style={styles.infoIcon}>
          <Icon name="information-circle-outline" size={25} color={theme.text} />
        </TouchableOpacity>
      </View>
          
      <Text style={[styles.title, { color: theme.text }]}>Perfil del Trabajador</Text>
      <View style={[styles.infoContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#f4f4f4" : "#333" }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.text }]}>Nombre:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.nombre || 'Sin nombre'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.text }]}>Apellido:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.apellido || 'Sin apellido'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.text }]}>Teléfono:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.text }]}>Email:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.email || 'Sin email'}</Text>
        </View>
      </View>
    
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#1e90ff" }]} onPress={handleEditProfile}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>
        {dataTrabajador.data.isAdmin && (
    <>
      <TouchableOpacity style={[styles.button, { backgroundColor: "#007BFF", marginVertical: 10 }]} 
        onPress={() => navigation.navigate('GestorSuscripcion')}>
        <Text style={styles.buttonText}>Gestionar Suscripción</Text>
      </TouchableOpacity>

      {microempresa && microempresa._id && (
        <TouchableOpacity style={[styles.button, { backgroundColor: "#007BFF", marginBottom: 10 }]} 
          onPress={() => navigation.navigate('VincularMercadoPago', { idMicroempresa: microempresa._id })}>
          <Text style={styles.buttonText}>Vincular Mercado Pago</Text>
        </TouchableOpacity>
      )}
    </>
  )}
      </View>
      
      <Modal 
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelEdit}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Perfil</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#FFFFFF" ? "gray" : "#777" }]}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={theme.text}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#FFFFFF" ? "gray" : "#777" }]}
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
              placeholderTextColor={theme.text}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#FFFFFF" ? "gray" : "#777" }]}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              placeholderTextColor={theme.text}
            />
            <TextInput 
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#FFFFFF" ? "gray" : "#777" }]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address" 
              placeholderTextColor={theme.text}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#FF0000" }]} onPress={handleCancelEdit}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#28a745" }]} onPress={handleSaveProfile}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoVisible}
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Para Reservas con Abono</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              Para habilitar la opción de abono en reservas, debes vincular tu cuenta con Mercado Pago,
              configurar el porcentaje de abono de un servicio y generar su link de pago.
            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoVisible(false)}>
              <Text style={styles.closedButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  }, 
  headerContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
    position: 'absolute',
    top: 10,
    zIndex: 10,
    right: 10,
  },
  infoIcon: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', 
  },
  infoContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  value: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  }, 
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginTop: 10, 
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5, 
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 15,
    padding: 5,
  },
  closedButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,  
  },
});
