import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity } from 'react-native'; 

import { AuthContext } from '../context/auth.context';
// Llamar services de usuario para actualizar datos y botones
import { getClienteById, updateCliente } from '../services/user.service'; 


export default function PerfilClienteScreen () {
    const { user } = useContext(AuthContext);
    

    const [dataCliente, setDataCliente] = useState(null);
    const [loading, setLoading] = useState(true);   
    const [modalVisible, setModalVisible] = useState(false);

    // Estados para los campos del formulario
        const [EditinguserId, setEditingUserId] = useState(null);
        const [nombre, setNombre] = useState('');
        const [apellido, setApellido] = useState('');
        const [telefono, setTelefono] = useState('');
        const [email, setEmail] = useState('');

    useEffect(() =>{
        const fetchClienteData = async () => {
            try {
                if (!user || !user.id) return null; 
                const clienteData = await getClienteById(user.id);
                setDataCliente(clienteData);
            } catch (error) {
                console.error("Error al cargar datos del cliente:", error);
                Alert.alert("Error", "No se pudo cargar la información del cliente");
            }finally{
                setLoading(false);
            }
        }; 
        fetchClienteData();
    },[user]);

    if(loading){
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }
    if(!dataCliente){
        return (
            <View style={styles.container}>
                <Text style={styles.error}>No se pudo cargar la información del cliente.</Text>
            </View>
        );
    } 
    const handleEditProfile = () => {
        setNombre(dataCliente.nombre || '');
        setApellido(dataCliente.apellido || '');
        setTelefono(dataCliente.telefono || '');
        setEmail(dataCliente.email || '');
        setEditingUserId(dataCliente._id || null);
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
            if (nombre !== dataCliente.data.nombre) updatedData.nombre = nombre;
            if (apellido !== dataCliente.data.apellido) updatedData.apellido = apellido;
            if (telefono !== dataCliente.data.telefono) updatedData.telefono = telefono;
            if (email !== dataCliente.data.email) updatedData.email = email;
            if (Object.keys(updatedData).length === 0) {
                Alert.alert("No hay cambios", "No se detectaron cambios en los datos del cliente");
                return;
            }

            const response = await updateCliente(EditinguserId, { clienteData: updatedData });

            if (response && !response[1]){
                setDataCliente({ ...dataCliente, data: { ...dataCliente.data, ...updatedData } });
                limpiarFormulario();
                Alert.alert("Datos actualizados", "Los datos del cliente se actualizaron correctamente");
            } else {
                Alert.alert('Error', 'No se pudo actualizar el perfil.');
            }

        } catch (error) {
            console.error("Error al actualizar datos del cliente:", error);
            Alert.alert("Error", "No se pudo actualizar los datos del cliente");
        } 
    };

    return(
         <View style={styles.container}>
                  <Text style={styles.title}>Perfil del Cliente</Text>
                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Nombre:</Text>
                      <Text style={styles.value}>{dataCliente.data.nombre || 'Sin nombre'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Apellido:</Text>
                      <Text style={styles.value}>{dataCliente.data.apellido || 'Sin apellido'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Teléfono:</Text>
                      <Text style={styles.value}>{dataCliente.data.telefono || 'Sin teléfono'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Email:</Text>
                      <Text style={styles.value}>{dataCliente.data.email || 'Sin email'}</Text>
                    </View>
        </View>
             <View style={styles.buttonContainer}>
                    <Button
                      title="Editar Perfil"
                      onPress={handleEditProfile}
                      color="blue"
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
