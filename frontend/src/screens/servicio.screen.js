import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, Modal, FlatList, ActivityIndicator 
} from 'react-native';
import ServicioService from "../services/servicio.service";
import mercadopagoServices from '../services/mercadopago.service.js';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTheme } from '../context/theme.context'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import MicroempresaService from '../services/microempresa.service.js';
const ServicioScreen = ({ route }) => {
  const { theme } = useTheme();
  const [servicios, setServicios] = useState([]);	
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [porcentajeAbono, setPorcentajeAbono] = useState(''); 
  const [editingServicioId, setEditingServicioId] = useState(null);
  const [vinculadoMP, setVinculadoMP] = useState(false);
  const { id } = route.params;
  const [infoVisible, setInfoVisible] = useState(false);

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

  useEffect(() => {
    const verificarVinculacion = async () => {
      try {
        const idMicroempresa = id;
        const [data, error] = await mercadopagoServices.getMercadoPagoAcc(idMicroempresa);
        if (error || !data || !data.state || data.state !== 'Success' || !data.data.accessToken) {
          console.log("La microempresa NO está vinculada a Mercado Pago.");
          setVinculadoMP(false);
          return;
        }
        console.log("La microempresa está vinculada a Mercado Pago.");
        setVinculadoMP(true);
      } catch (error) {
        console.error('Error al verificar la vinculación con MercadoPago:', error.message);
        setVinculadoMP(false);
      }
    };
    verificarVinculacion();
  }, [id]);

  const handleEliminarServicio = async (idServicio) => {
    try { 
      console.log("ID servicio: ", idServicio);
      const response = await ServicioService.deleteServicio(idServicio);
      if (response.state === 'Success') {
        Alert.alert('Servicio eliminado', 'El servicio se ha eliminado correctamente.');
        setServicios(servicios.filter(servicio => servicio._id !== idServicio));
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
      duracion: parseInt(duracion, 10), // en minutos
      descripcion,
      porcentajeAbono: porcentajeAbono ? parseFloat(porcentajeAbono) : 0,
    };
    try {
      const response = await ServicioService.createServicio(nuevoServicio); 
      if(response.state === 'Success'){
        setServicios([...servicios, response.data]);
        limpiarFormulario();
        Alert.alert('Éxito', 'El servicio se ha agregado correctamente.');
      } else {
        Alert.alert('Error', response.message);
      } 
    } catch (error) {
      console.error('Error al agregar el servicio:', error.message);
      Alert.alert('Hubo un problema al agregar el servicio.', error.message);
    }
  };

  const handleEditarServicio = (servicio) => {  
    setNombre(servicio.nombre);
    setPrecio(String(servicio.precio));
    setDuracion(String(servicio.duracion));
    setDescripcion(servicio.descripcion);
    setPorcentajeAbono(servicio.porcentajeAbono ? String(servicio.porcentajeAbono) : '');
    setEditingServicioId(servicio._id);
    setShowForm(true);     
  }; 

  const handleGuardar = async () => {
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

  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setDuracion('');
    setDescripcion('');
    setPorcentajeAbono('');
    setEditingServicioId(null);
    setShowForm(false);
  };
   
  const handleGenerarPago = async (idServicio) => {
    try {
      console.log("ID servicio para generar pago:", idServicio);
      const [urlPago, error] = await mercadopagoServices.crearPreferenciaServicio(idServicio);
      if (error) {
        Alert.alert("Error Al generar pago", error.message);
        return;
      }
      console.log("URL de pago generada:", urlPago);
      setServicios(servicios.map(servicio => 
        servicio._id === idServicio ? { ...servicio, urlPago } : servicio
      ));
      Alert.alert("Éxito", "Se ha generado la preferencia de pago.");
    } catch (error) {
      console.error("Error al generar la preferencia de pago:", error.message);
      Alert.alert("Error", "Hubo un problema al generar la preferencia de pago.");
    }
  };
     
  const renderServicioItem = ({ item }) => (
    <View style={[styles.servicioCard, { backgroundColor: theme.background === "#FFFFFF" ? "#f2f2f2" : "#333" }]}>
       {/* Contenedor del nombre del servicio e ícono de información */}
    <View style={styles.servicioHeader}>
      <Text style={[styles.servicioName, { color: theme.text }]}>{item.nombre}</Text>
      <TouchableOpacity onPress={() => handleShowInformation(item)}>
        <Icon name="info-circle" size={20} color={theme.text} />
      </TouchableOpacity>
    </View>
      <Text style={[styles.servicioDetail, { color: theme.text }]}>💲 Precio: ${item.precio}</Text>
      <Text style={[styles.servicioDetail, { color: theme.text }]}>⏳ Duración: {item.duracion} minutos</Text>
      <Text style={[styles.servicioDetail, { color: theme.text }]}>📖 {item.descripcion}</Text>
      {item.porcentajeAbono !== undefined && item.porcentajeAbono > 0 && (
        <Text style={[styles.servicioDetail, { color: theme.text }]}>💳 Abono: {item.porcentajeAbono}%</Text>
      )}
      {item.urlPago && <Text style={styles.pagoGeneradoText}>✅ Abono Generado</Text>} 
      {vinculadoMP && item.porcentajeAbono !== 0 && (
        <TouchableOpacity onPress={() => handleGenerarPago(item._id)} style={styles.generarPagoButton}>
          <Text style={styles.buttonText}>Generar link de Pago</Text>
        </TouchableOpacity>
      )} 
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleEditarServicio(item)} style={styles.editButton}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEliminarServicio(item._id)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>  
      </View>  
    </View>
  );  

  const handleShowInformation = () => {
    setInfoVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Servicios</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <AntDesign name="plus" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={{ color: theme.text }}>Cargando servicios...</Text>
        </View>
      ) : (
        <FlatList
          data={servicios}
          keyExtractor={(item) => item._id}
          renderItem={renderServicioItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={[styles.noServicesText, { color: theme.text }]}>No hay servicios agregados.</Text>}
        />
      )}

      {/* Modal para formulario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showForm}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#444" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Agrega un Servicio</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
              placeholder="Nombre" 
              value={nombre} 
              onChangeText={setNombre}
              placeholderTextColor={theme.text}
            />
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
              placeholder="Precio" 
              keyboardType="numeric" 
              value={precio} 
              onChangeText={(text) => { 
                const numericValue = text.replace(/[^0-9.]/g, '');  
                setPrecio(numericValue);
              }}
              placeholderTextColor={theme.text}
            />
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
              placeholder="Duración (en minutos)" 
              keyboardType="numeric" 
              value={duracion} 
              onChangeText={(text) => { 
                const numericValue = text.replace(/[^0-9.]/g, '');  
                setDuracion(numericValue);
              }}
              placeholderTextColor={theme.text}
            />
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
              placeholder="Descripción" 
              value={descripcion} 
              onChangeText={setDescripcion}
              placeholderTextColor={theme.text}
            />
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#555" }]} 
              placeholder="Porcentaje Abono (Opcional)" 
              keyboardType="numeric" 
              value={porcentajeAbono} 
              onChangeText={(text) => {
                let num = text.replace(/[^0-9]/g, '');
                if (num !== '' && parseInt(num, 10) > 100) {
                  num = '100';
                } 
                setPorcentajeAbono(num);
              }}
              placeholderTextColor={theme.text}
            />
            <View style={styles.formButtonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={limpiarFormulario}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={editingServicioId ? handleGuardar : handleAgregarServicio}>
                <Text style={styles.submitButtonText}>{editingServicioId ? 'Guardar' : 'Agregar'}</Text>
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
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Para Reservas con Abono</Text>
      <Text style={styles.modalText}>
        Para activar la función de reservar con abono es necesario:
      </Text>
      <Text style={styles.modalText}>
        1) Vincular tu cuenta de ReserBio con Mercado Pago en la pantalla de perfil. {"\n\n"} 

        2) Configurar el porcentaje de abono del servicio que quieres exigir abono. {"\n\n"}

        3) Generar el link de pago del servicio.
      </Text>
      <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoVisible(false)}>
        <Text style={styles.modalButtonText}>Cerrar</Text>
      </TouchableOpacity>
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
    color: '#000000',
    letterSpacing: 1,
  }, 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  noServicesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  servicioCard: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
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
  servicioName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  servicioDetail: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#28a745",
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
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
    
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fonrtWeight: 'Inter',
  }, 
  generarPagoButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  pagoGeneradoText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',  // Asegura alineación correcta con el nombre del servicio
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

export default ServicioScreen;
