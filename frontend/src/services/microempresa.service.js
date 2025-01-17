import instance from './root.services.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getUserIdFromAsyncStorage() {
  try {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    return parsedUser?.id;
  } catch (error) {
    console.error('❌ Error al obtener el ID del usuario desde AsyncStorage:', error.message);
    throw error;
  }
}

// Crear una microempresa
async function createMicroempresa(datosFormulario) {
  try {
    const userId = await getUserIdFromAsyncStorage();

    if (!userId) throw new Error('El ID del usuario no está disponible.');

    const nuevaMicroempresa = {
      ...datosFormulario,
      idTrabajador: userId,
    };

    const response = await instance.post('/microempresas', nuevaMicroempresa);
    console.log('📡 Microempresa creada:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Error al crear la microempresa:', error.response?.data || error.message);
    throw error;
  }
}

async function getMicroempresaData(idMicroempresa) {
  try {
    const response = await instance.get(`/microempresas/${idMicroempresa}`);
    console.log('📋 Datos de la microempresa obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener los datos de la microempresa:', error.response?.data || error.message);
    throw error;
  }
}

async function getMicroempresasByUser(trabajadorId) {
  try {
    // ✅ URL CORREGIDA
    const response = await instance.get(`/microempresas/user/${trabajadorId}`);
    console.log('📡 Microempresas obtenidas:', response);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Error al obtener datos de las microempresas:',
      error.response?.data || error.message
    );
    throw error;
  }
}

export default {
  getMicroempresaData,
  getMicroempresasByUser,
  createMicroempresa,
};
