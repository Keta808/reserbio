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
import { getTrabajadorById, changePassword } from '../services/user.service'; 
import MicroempresaServices from '../services/microempresa.service.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/theme.context';
import mercadoPagoServices from '../services/mercadopago.service';  

export default function TrabajadorScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation(); 
  const { theme } = useTheme();

  const [dataTrabajador, setDataTrabajador] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [microempresa, setMicroempresa] = useState(null);

  // Estados para el modal de cambio de contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);
  const [mercadoPagoAcc, setMercadoPagoAcc] = useState(null);

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
  }, [user]);

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
  
  useEffect(() => { 
      if (!microempresa || !microempresa._id) return;
      const verificarVinculacion = async () => {
        try {
          const idMicroempresa = microempresa._id;
          

          const [data, error] = await mercadoPagoServices.getMercadoPagoAcc(idMicroempresa);
          if (error || !data || !data.state || data.state !== 'Success' || !data.data.accessToken) {
            console.log("La microempresa NO está vinculada a Mercado Pago.");
            setMercadoPagoAcc(false);
            return;
          }
          console.log("La microempresa está vinculada a Mercado Pago.");
          setMercadoPagoAcc(true);
        } catch (error) {
          console.error('Error al verificar la vinculación con MercadoPago:', error.message);
          setMercadoPagoAcc(false);
        }
      };
      verificarVinculacion();
    }, [microempresa]);
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={{ color: theme.text }}>Cargando perfil del trabajador...</Text>
      </View>
    );
  }
    
  if (!dataTrabajador) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.error, { color: theme.text }]}>
          No se pudo cargar la información del trabajador.
        </Text>
      </View>
    );
  }
  
  // Función para cambiar contraseña
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Por favor completa ambos campos.");
      return;
    }
    try {
      const [message, error] = await changePassword(user.id, oldPassword, newPassword);
      if (error) {
        Alert.alert("Error", error);
      } else {
        Alert.alert("Éxito", "Contraseña actualizada correctamente.");
        setModalVisible(false);
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo cambiar la contraseña.");
    }
  };

  const handleShowInformation = () => {
    setInfoVisible(true);
  };
  const handleEliminarVinculacion = () => {
    if (!microempresa || !microempresa._id) {
      Alert.alert("Error", "No se encontró una microempresa vinculada.");
      return;
    }

    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar la vinculación con Mercado Pago? Si quieres volver a vincular deberas hacer todo el proceso denuevo",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              const [response, error] = await mercadoPagoServices.deleteMercadoPago(microempresa._id);
              if (error) {
                Alert.alert("Error", "No se pudo eliminar la vinculación.");
                return;
              }
              Alert.alert("Éxito", "La vinculación con Mercado Pago ha sido eliminada correctamente.");
              console.log("Vinculación eliminada:", response);  
            } catch (err) {
              console.error("Error al eliminar vinculación:", err);
              Alert.alert("Error", "Ocurrió un problema al eliminar la vinculación.");
            }
          },
          style: "destructive",
        },
      ]
    );
  } 

  // funcion para ir a historial de trabajadores
  const handleVerHistorial = () => {
    navigation.navigate('HistorialTrabajador', { idTrabajador: user.id });
  };  

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleShowInformation} style={styles.infoIcon}>
          <Icon name="info-circle" size={25} color={theme.text} />
        </TouchableOpacity>
      </View>
          
      <Text style={[styles.title, { color: theme.text }]}>Perfil del Trabajador</Text>
      <View style={[styles.infoContainer, { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#444" }]}>
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Nombre: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.nombre || 'Sin nombre'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Apellido: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.apellido || 'Sin apellido'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Teléfono: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="envelope" size={20} color="#007BFF" style={styles.infoIcon} />
          <Text style={[styles.label, { color: theme.text }]}>Email: </Text>
          <Text style={[styles.value, { color: theme.text }]}>{dataTrabajador.data.email || 'Sin email'}</Text>
        </View>
      </View>
    
      <View style={styles.buttonContainer}>
        {/* Botón para cambiar contraseña */}
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Icon name="lock" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleVerHistorial}>
          <Icon name="list-alt" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Ver Historial de Trabajador</Text>
        </TouchableOpacity>
        {/* Los demás botones se mantienen */}
        {dataTrabajador.data.isAdmin && (
          <>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GestorSuscripcion')}>
              <Icon name="cogs" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Gestionar Suscripción</Text>
            </TouchableOpacity>
            {microempresa && microempresa._id && (
              <>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VincularMercadoPago', { idMicroempresa: microempresa._id })}>
                  <Icon name="money" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Vincular Mercado Pago</Text>
                </TouchableOpacity>

                {dataTrabajador.data.isAdmin && mercadoPagoAcc && (
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleEliminarVinculacion}>
                    <Icon name="trash" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Eliminar Vinculación</Text>
                  </TouchableOpacity>
)}
              </>
            )}
          </>
        )}
      </View>
      
      {/* Modal para cambio de contraseña */}
      <Modal 
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Cambiar Contraseña</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#FFFFFF" ? "#CED4DA" : "#777" }]}
              placeholder="Contraseña Actual"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholderTextColor={theme.text}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.background === "#FFFFFF" ? "#CED4DA" : "#777" }]}
              placeholder="Nueva Contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor={theme.text}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Icon name="times" size={18} color="#fff" style={styles.modalButtonIcon} />
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleChangePassword}>
                <Icon name="check" size={18} color="#fff" style={styles.modalButtonIcon} />
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> 
        {/* Modal de Información */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoVisible}
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vinculacion con Mercado Pago</Text>
            <Text style={styles.modalText}>
              Para activar la función de reservar con abono es necesario:
            </Text>
            <Text style={styles.modalText}>
              1) Vincular tu cuenta de ReserBio con Mercado Pago.{"\n"}
              2) Configurar el porcentaje de abono de un servicio.{"\n"}
              3) Generar el link de pago del servicio. {"\n\n"} 
              Debes ser dueño de una microempresa para poder vincular tu cuenta y exigir abonos para reservas. Una vez vinculado puedes usar tu cuenta de Mercado Pago para recibir el dinero de los abonos.

            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
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
  },
  headerContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  infoIcon: {
    marginRight: 10,
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
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#495057',
    marginRight: 5,
  },
  value: {
    fontSize: 16,
    color: '#6C757D',
  },
  // Botones (todos con el mismo ancho y estilo)
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  button: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  // Modal estilos
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    width: '90%',
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
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  modalButtonIcon: {
    marginRight: 5,
  },
  // Header Card para datos de la microempresa (mantiene los datos ordenados)
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalCloseButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
