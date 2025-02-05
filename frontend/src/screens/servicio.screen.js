// Pantalla para configurar servicios 
import React, { useEffect, useState, useContext } from 'react'; 
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
// import { AuthContext } from '../context/auth.context';
import { useNavigation } from '@react-navigation/native';
import { getServiciosByMicroempresaId, deleteServicio, createServicio, configurarPorcentajeAbono, updateServicio   } from '../services/servicio.service';


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
    const navigation = useNavigation();
    // const { user } = useContext(AuthContext);   
    const { microempresaId } = route.params;

    useEffect(() => {
        const fetchServicios = async () => {
            try { 
                setLoading(true); 
                console.log("Microempresa ID: ", microempresaId)
                if (!id) {
                    Alert.alert('Error', 'No se proporcionó el ID de la microempresa.');
                    setLoading(false);
                    return;
                }
                const data = await getServiciosByMicroempresaId(microempresaId);
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
    }, [microempresaId]);
    const handleEliminarServicio = async (id) => {
        try { 
            console.log("ID servicio: ", id)
            const response = await deleteServicio(id);
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
        const nuevoServicio = {
            idMicroempresa: microempresaId,
            nombre,
            precio: parseFloat(precio), 
            duracion: parseInt(duracion, 10), // Minutos
            descripcion,
            porcentajeAbono: porcentajeAbono ? parseFloat(porcentajeAbono) : 0,
        };
        try{
            const response = await createServicio(nuevoServicio); 
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
        const servicioActualizado = {
            idMicroempresa: microempresaId,
            nombre,
            precio: parseFloat(precio),
            duracion: parseInt(duracion, 10),
            descripcion,
            porcentajeAbono: porcentajeAbono ? parseFloat(porcentajeAbono) : 0,
        }; 

        try {
            const response = await updateServicio(editingServicioId, servicioActualizado); 
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
    const handleVolver = () => {
        navigation.goBack();
    };
    const handleConfigurarPorcentajeAbono = async (id, porcentaje) => {
        let newPorcentaje = porcentaje ? String(porcentaje) : '';

        Alert.prompt(
            "Configurar Porcentaje de Abono",
            "Ingrese el porcentaje de abono (0-100):",
            [ 
                {text: "Cancelar", style: "cancel"},
                { text: "Guardar",
                    onPress: async (valorIngresado) => {
                        const porcentaje = parseFloat(valorIngresado);
                        if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
                            Alert.alert('Error', 'Por favor, ingrese un porcentaje válido.');
                            return;
                        }
                        try {
                            const response = await configurarPorcentajeAbono(id, { porcentajeAbono: porcentaje });
                            if (response.state === 'Success'){
                                setServicios(servicios.map(servicio => 
                                    servicio._id === id ? { ...servicio, porcentajeAbono: porcentaje } : servicio
                                ));
                                Alert.alert('Éxito', 'El porcentaje de abono se ha configurado correctamente.');
                            } else {
                                Alert.alert('Error', response.message);
                            }   
                        } catch (error) {
                            console.error('Error al configurar el porcentaje de abono:', error.message);
                            Alert.alert('Error', 'Hubo un problema al configurar el porcentaje de abono.');
                        }
                    }
                }
            ],
            "plain-text",
            newPorcentaje
        );    
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
            {servicios.length === 0 ? (
                <Text style={styles.noServicesText}>No hay servicios agregados.</Text>
            ) : (
                <View>
                    {servicios.map(servicio => (
                        <View key={servicio._id} style={styles.servicioItem}>
                            <Text style={styles.servicioName}>{servicio.nombre}</Text>
                            <Text style={styles.servicioDetail}>Precio: ${servicio.precio}</Text>
                            <Text style={styles.servicioDetail}>Duración: {servicio.duracion} minutos</Text>
                            <Text style={styles.servicioDetail}>Descripción: {servicio.descripcion}</Text>
                            {servicio.porcentajeAbono && (
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
                </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
                <Text style={styles.addButtonText}>{showForm ? 'Cancelar' : 'Agregar Servicio'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={handleVolver}> </TouchableOpacity>
            {showForm && (
                <View style={styles.formContainer}>
                    <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
                    <TextInput style={styles.input} placeholder="Precio" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
                    <TextInput style={styles.input} placeholder="Duración" keyboardType="numeric" value={duracion} onChangeText={setDuracion} />
                    <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />
                    <TextInput style={styles.input} placeholder="Porcentaje Abono" keyboardType="numeric" value={porcentajeAbono} onChangeText={setPorcentajeAbono} />

                    <TouchableOpacity style={styles.submitButton} onPress={editingServicioId ? handleGuardar : handleAgregarServicio}>
                        <Text style={styles.submitButtonText}>{editingServicioId ? 'Guardar Cambios' : 'Agregar'}</Text>
                    </TouchableOpacity> 
                    <TouchableOpacity onPress={() => handleConfigurarPorcentajeAbono(servicio._id, servicio.porcentajeAbono)}>
                        <Text style={styles.configPorcentajeButton}>Configurar Abono</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
        marginBottom: 10,
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
        color: 'blue',
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
        backgroundColor: '#007bff',
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
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ServicioScreen;