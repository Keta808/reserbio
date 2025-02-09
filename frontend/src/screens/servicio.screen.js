// Pantalla para configurar servicios 
import React, { useEffect, useState} from 'react'; 
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
// import { AuthContext } from '../context/auth.context';
// import { useNavigation } from '@react-navigation/native';
import ServicioService from "../services/servicio.service";
import AntDesign from '@expo/vector-icons/AntDesign';

const ServicioScreen = ({ route }) => {

    const [servicios, setServicios] = useState([]);	
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [duracion, setDuracion] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [porcentajeAbono, setPorcentajeAbono] = useState(''); 
    const [editingServicioId, setEditingServicioId] = useState(null);
    // const navigation = useNavigation();
    // const { user } = useContext(AuthContext);   
    const { id } = route.params;

    useEffect(() => {
        const fetchServicios = async () => {
            try { 
                setLoading(true); 
                
                const microempresaId = id;

                if (!microempresaId) {
                    Alert.alert('Error', 'No se proporcionó el ID de la microempresa.');
                    setLoading(false);
                    return;
                }
                const data = await ServicioService.getServiciosByMicroempresaId(microempresaId);
                if (data.state === 'Success' && Array.isArray(data.data)) {
                    setServicios(data.data);
                }
            } catch (error) {
                console.error('Error al obtener los servicios:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServicios();
    }, [id]);
    const handleEliminarServicio = async (id) => {
        try { 
            console.log("ID servicio: ", id)
            const response = await ServicioService.deleteServicio(id);
            if (response.state === 'Success') {
                Alert.alert('Servicio eliminado', 'El servicio se ha eliminado correctamente.');
                setServicios(servicios.filter(servicio => servicio._id !== id));
            } else {
                Alert.alert('Error', response.message);
            }
        } catch (error) {
            console.error('Error al eliminar el servicio:', error.message);
        }
    }; 
    const handleAgregarServicio = async () => {
        
        if (!nombre || !precio || !duracion || !descripcion) {
            Alert.alert('Error', 'Por favor, complete todos los campos obligatorios.');
            return;
        } 
        if (isNaN(precio) || parseFloat(precio) <= 0) {
            Alert.alert('Error', 'El precio debe ser un número mayor a 0.');
            return;
        }
    
        if (isNaN(duracion) || parseInt(duracion, 10) <= 0) {
            Alert.alert('Error', 'La duración debe ser un número mayor a 0.');
            return;
        } 

        if (porcentajeAbono !== '' && (parseFloat(porcentajeAbono) < 0 || parseFloat(porcentajeAbono) > 100)) {
            Alert.alert('Error', 'El porcentaje de abono debe estar entre 0 y 100.');
            return;
        } 
        const nuevoServicio = {
            idMicroempresa: id,
            nombre,
            precio: parseFloat(precio), 
            duracion: parseInt(duracion, 10), // Minutos
            descripcion,
            porcentajeAbono: porcentajeAbono ? parseFloat(porcentajeAbono) : 0,
        };
        try{
            const response = await ServicioService.createServicio(nuevoServicio); 
            if(response.state === 'Success'){
                setServicios([...servicios, response.data]);
                limpiarFormulario();
                Alert.alert('Éxito', 'El servicio se ha agregado correctamente.');
            }else{
                Alert.alert('Error', response.message);
            } 
            
        }  catch (error) {
            console.error('Error al agregar el servicio:', error.message);
            Alert.alert('Error', 'Hubo un problema al agregar el servicio.');
        }
    };
    const handleEditarServicio = (servicio) => {  
        setNombre(servicio.nombre);
        setPrecio(String(servicio.precio));
        setDuracion(String(servicio.duracion));
        setDescripcion(servicio.descripcion);
        setPorcentajeAbono(servicio.porcentajeAbono ? String(servicio.porcentajeAbono) : '');
        setEditingServicioId(servicio._id); // Guardamos el ID del servicio que se está editando
        setShowForm(true);     
    }; 
    const handleGuardar = async () =>{
        if (!nombre || !precio || !duracion || !descripcion) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }  
        if (porcentajeAbono !== '' && (parseFloat(porcentajeAbono) < 0 || parseFloat(porcentajeAbono) > 100)) {
            Alert.alert('Error', 'El porcentaje de abono debe estar entre 0 y 100.');
            return;
        } 
        if (isNaN(precio) || parseFloat(precio) <= 0) {
            Alert.alert('Error', 'El precio debe ser un número mayor a 0.');
            return;
        }
    
        if (isNaN(duracion) || parseInt(duracion, 10) <= 0) {
            Alert.alert('Error', 'La duración debe ser un número mayor a 0.');
            return;
        } 
        const servicioActualizado = {
            idMicroempresa: id,
            nombre,
            precio: parseFloat(precio),
            duracion: parseInt(duracion, 10),
            descripcion,
            porcentajeAbono: porcentajeAbono ? parseFloat(porcentajeAbono) : 0,
        }; 

        try {
            const response = await ServicioService.updateServicio(editingServicioId, servicioActualizado); 
            if (response.state === 'Success') {
                setServicios(servicios.map(servicio => 
                    servicio._id === editingServicioId ? response.data : servicio
                ));
                limpiarFormulario();
                Alert.alert('Éxito', 'El servicio se ha actualizado correctamente.');
            } else {
                Alert.alert('Error', response.message);
            }
        } catch (error) {
            console.error('Error al actualizar el servicio:', error.message);
            Alert.alert('Error', 'Hubo un problema al actualizar el servicio.');
        }
    }; 
    // FUNCIÓN PARA LIMPIAR FORMULARIO
    const limpiarFormulario = () => {
        setNombre('');
        setPrecio('');
        setDuracion('');
        setDescripcion('');
        setPorcentajeAbono('');
        setEditingServicioId(null);
        setShowForm(false);
    };
   
    
    if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <Text>Cargando servicios...</Text>
          </View>
        );
    } 
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Servicios</Text>
                <TouchableOpacity onPress={() => setShowForm(true)}>
                    <AntDesign name="plus" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {servicios.length === 0 && <Text style={styles.noServicesText}>No hay servicios agregados.</Text>}

                {servicios.map(servicio => (
                    <View key={servicio._id} style={styles.servicioItem}>
                        <Text style={styles.servicioName}>{servicio.nombre}</Text>
                        <Text style={styles.servicioDetail}>Precio: ${servicio.precio}</Text>
                        <Text style={styles.servicioDetail}>Duración: {servicio.duracion} minutos</Text>
                        <Text style={styles.servicioDetail}>Descripción: {servicio.descripcion}</Text>
                        {servicio.porcentajeAbono !== undefined && (
                            <Text style={styles.servicioDetail}>Porcentaje de Abono: {servicio.porcentajeAbono}%</Text>
                        )} 
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => handleEditarServicio(servicio)}>
                                <Text style={styles.editButton}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleEliminarServicio(servicio._id)}>
                                <Text style={styles.deleteButton}>Eliminar</Text>
                            </TouchableOpacity>  
                        </View>  
                    </View>
                ))}
            </ScrollView>

            {/* MODAL PARA FORMULARIO */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showForm}
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Agrega un Servicio</Text>

                        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
                        <TextInput style={styles.input} placeholder="Precio" keyboardType="numeric" value={precio} onChangeText={(text) => { const numericValue = text.replace(/[^0-9.]/g, '');  setPrecio(numericValue);}} />
                        <TextInput style={styles.input} placeholder="Duración (en minutos)" keyboardType="numeric" value={duracion} onChangeText={(text) => { const numericValue = text.replace(/[^0-9.]/g, '');  setDuracion(numericValue);}} />
                        <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />
                        <TextInput style={styles.input} placeholder="Porcentaje Abono para reserva (Opcional)" keyboardType="numeric" value={porcentajeAbono} onChangeText={(text) => {
                            let num = text.replace(/[^0-9]/g, ''); // Permitir solo números
                            if (num !== '' && parseInt(num, 10) > 100) {
                            num = '100'; } setPorcentajeAbono(num);}} />

                        <View style={styles.formButtonsContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={limpiarFormulario}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={editingServicioId ? handleGuardar : handleAgregarServicio}>
                                <Text style={styles.submitButtonText}>{editingServicioId ? 'Guardar Cambios' : 'Agregar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}; 

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#696969',
        letterSpacing: 1,
    }, 
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 15,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noServicesText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    servicioItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 20,
    },
    servicioName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    servicioDetail: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    editButton: {
        color: 'green',
        marginRight: 10,
    },
    deleteButton: {
        color: 'red',
        marginRight: 10,
    },
    configPorcentajeButton: {
        color: 'orange',
        marginRight: 10,
    },
    addButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    backButton: {
        backgroundColor: '#6c757d',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    formContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginLeft: 5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    }, 
    formButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ServicioScreen;