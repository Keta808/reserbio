import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity } from 'react-native'; 
import { useNavigation } from '@react-navigation/native'; 
import { AuthContext } from '../context/auth.context';
// Llamar services de usuario para actualizar datos y botones
import { getTrabajadorById, updateTrabajador } from '../services/user.service'; 
import MicroempresaServices from '../services/microempresa.service';


export default function TrabajadorScreen() {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation(); 
    const [dataTrabajador, setDataTrabajador] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [modalVisible, setModalVisible] = useState(false);

    // Estados para los campos del formulario
    const [EditinguserId, setEditingUserId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [microempresa, setMicroempresa] = useState(null);
    // Microempresa Data
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

    },[]);
    useEffect(() => {
        const fetchTrabajadorData = async () => {
          try {
            if (!user) {
              throw new Error("No se pudo identificar al trabajador.");
            }
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
            <Text>Cargando perfil del trabajador...</Text>
          </View>
        );
      }
    
      if (!dataTrabajador) {
        return (
          <View style={styles.container}>
            <Text style={styles.error}>No se pudo cargar la información del trabajador.</Text>
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
    }
    const handleSaveProfile = async () => {
      try {
        const updatedData = {};
        if (nombre !== dataTrabajador.data.nombre) updatedData.nombre = nombre;
        if (apellido !== dataTrabajador.data.apellido) updatedData.apellido = apellido;
        if (telefono !== dataTrabajador.data.telefono) updatedData.telefono = telefono;
        if (email !== dataTrabajador.data.email) updatedData.email = email;

        // Si no hay cambios, no hacer la petición
        if (Object.keys(updatedData).length === 0) {
            Alert.alert('No hay cambios', 'No has realizado modificaciones.');
            return;
        }

        // Enviar al backend con la estructura esperada
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

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Perfil del Trabajador</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{dataTrabajador.data.nombre || 'Sin nombre'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Apellido:</Text>
              <Text style={styles.value}>{dataTrabajador.data.apellido || 'Sin apellido'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{dataTrabajador.data.telefono || 'Sin teléfono'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{dataTrabajador.data.email || 'Sin email'}</Text>
            </View>
          </View>
    
          <View style={styles.buttonContainer}>
            <Button
              title="Editar Perfil"
              onPress={handleEditProfile}
              color="blue"
            />
            <View style={{ marginVertical: 10 }}>
              <Button
                title="Gestionar Suscripción"
                onPress={() => navigation.navigate('GestorSuscripcion')}
                color="#007BFF"
              />
            </View>
            {/* Mostrar opción solo si el usuario tiene una microempresa */}
             {microempresa !== null && (
              <View style={{ marginBottom: 10 }}>
              <Button title="Vincular Mercado Pago" onPress={() => navigation.navigate('VincularMercadoPago', { idMicroempresa: microempresa._id })} color="#007BFF" />
            </View>
            )}
            <Button
              title="Volver"
              onPress={() => navigation.goBack()}
              color="#FF6347"
            /> 
             
          </View>
          <Modal 
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCancelEdit}>
            <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Perfil</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Apellido"
                            value={apellido}
                            onChangeText={setApellido}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                        /> 
                        <TextInput 
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address" 
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }]} onPress={handleCancelEdit}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'green' }]} onPress={handleSaveProfile}>
                                <Text style={styles.buttonText}>Guardar</Text>
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
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    color: '#000000',
  },
  infoContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  }, 
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
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
buttonText: {
  color: 'white',
  fontSize: 16,
}, 
input: {
  width: '100%',
  borderBottomWidth: 1,
  borderBottomColor: 'gray',
  marginBottom: 15,
  padding: 5,
},
});