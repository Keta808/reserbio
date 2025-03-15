import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Modal, 
  Pressable, 
  TouchableOpacity, 
  StyleSheet, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/auth.context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/theme.context';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // true = Trabajador, false = Cliente
  const [isTrabajador, setIsTrabajador] = useState(false);
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  // Datos de prueba para logeo rápido
  const email_prueba = 'trabajador@email.com';
  const password_prueba = 'trabajador123';
  const cliente_prueba = 'cliente@email.com';
  const password_cliente = 'cliente123';

  // Estado y animación para el modal (errores)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, fadeAnim]);

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('Error', 'Por favor, complete todos los campos');
      return;
    }
    try {
      const dataUser = { email, password, kind: isTrabajador ? 'Trabajador' : 'Cliente' };
      const response = await login(dataUser); // Capturamos la respuesta del backend
      console.log('Usuario autenticado:', response);
      // Aquí se puede continuar, por ejemplo, navegando a otra pantalla.
    } catch (error) {
      let errorMessage = 'El usuario o la contraseña son incorrectos';
      // Verificamos si el error viene con la estructura esperada
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      showModal('Error', errorMessage);
    }
  };
  

  const handleLoginPrueba = async () => {
    try {
      const dataUser = { email: email_prueba, password: password_prueba, kind: 'Trabajador' };
      await login(dataUser);
      // No se muestra confirmación de éxito.
    } catch (error) {
      showModal('Error', 'El usuario o la contraseña son incorrectos');
    }
  };

  const handleLoginCliente = async () => {
    try {
      const dataUser = { email: cliente_prueba, password: password_cliente, kind: 'Cliente' };
      await login(dataUser);
      // No se muestra confirmación de éxito.
    } catch (error) {
      showModal('Error', 'El usuario o la contraseña son incorrectos');
    }
  };

  const handleGoToRegister = () => {
    navigation.navigate('RegistroCliente');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.welcomeTitle, { color: theme.text }]}>¡Bienvenido a ReserBio!</Text>
      <Text style={[styles.title, { color: theme.text }]}>Iniciar Sesión</Text>
      
      {/* Toggle personalizado para elegir rol */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, isTrabajador && styles.selectedButton]} 
          onPress={() => setIsTrabajador(true)}
        >
          <Ionicons name="briefcase" size={20} color={isTrabajador ? "#fff" : "#333"} />
          <Text style={[styles.toggleButtonText, isTrabajador && styles.selectedButtonText]}>
            Trabajador
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, !isTrabajador && styles.selectedButton]} 
          onPress={() => setIsTrabajador(false)}
        >
          <Ionicons name="person" size={20} color={!isTrabajador ? "#fff" : "#333"} />
          <Text style={[styles.toggleButtonText, !isTrabajador && styles.selectedButtonText]}>
            Cliente
          </Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={[styles.input, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#333", color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777" }]}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.background === "#FFFFFF" ? "#fff" : "#333", color: theme.text, borderColor: theme.background === "#FFFFFF" ? "#ccc" : "#777" }]}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Ingresar</Text>
      </TouchableOpacity>
      
      {/* Botones de logeo rápido para pruebas */}
      <View style={styles.quickLoginContainer}>
        <TouchableOpacity style={styles.quickButton} onPress={handleLoginPrueba}>
          <Text style={styles.quickButtonText}>Logeo rápido Trabajador</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={handleLoginCliente}>
          <Text style={styles.quickButtonText}>Logeo rápido Cliente</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={handleGoToRegister}>
        <Text style={[styles.registerText, { color: theme.text }]}>
          ¿Aún no tienes una cuenta? <Text style={styles.registerLink}>Regístrate aquí</Text>
        </Text>
      </TouchableOpacity>

      {/* Modal para mensajes de error */}
      <Modal
        transparent={true}
        animationType="none"
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }, styles.modalError]}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <Pressable style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007BFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#ccc',
    overflow: 'hidden',
    marginBottom: 25,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
  },
  selectedButton: {
    backgroundColor: '#007BFF',
  },
  toggleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickLoginContainer: {
    marginBottom: 20,
  },
  quickButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickButtonText: {
    color: '#333',
    fontSize: 14,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: '#007BFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalError: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF0000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

