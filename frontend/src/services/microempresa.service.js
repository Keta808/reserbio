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
    if (!idMicroempresa) {
      throw new Error('El ID de la microempresa es obligatorio.');
    }

    const response = await instance.get(`/microempresas/${idMicroempresa}`);
    if (!response?.data?.data) {
      throw new Error('La respuesta no contiene datos válidos.');
    }

    // console.log('📋 Datos de la microempresa obtenidos:', response.data.data);
    return response.data; // Asegúrate de devolver solo la clave `data` del backend
  } catch (error) {
    console.error('❌ Error al obtener los datos de la microempresa:', error.response?.data || error.message || error);
    throw error;
  }
}

async function getMicroempresas() {
  try {
    const response = await instance.get('/microempresas'); // Llama al endpoint
    console.log('📋 Microempresas obtenidas:', response.data); // Opcional: para debug
    return response.data; // Devuelve las microempresas
  } catch (error) {
    console.error('❌ Error al obtener las microempresas:', error.response?.data || error.message);
    throw error;
  }
}

async function getMicroempresasForPage(page = 1, limit = 10) {
  try {
    const response = await instance.get(`/microempresas/page/${page}/limit/${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener microempresas paginadas:", error.response?.data || error.message);
    throw error;
  }
}


async function updateMicroempresa(id, datosActualizados) {
  try {
      const response = await instance.put(`/microempresas/${id}`, datosActualizados);
      console.log("📡 Microempresa actualizada:", response.data);
      return response.data;
  } catch (error) {
      console.error("❌ Error al actualizar la microempresa:", error.response?.data || error.message);
      throw error;
  }
}

async function getMicroempresasByUser(trabajadorId) {
  try {
    // ✅ URL CORREGIDA
    const response = await instance.get(`/microempresas/user/${trabajadorId}`);
    // console.log('📡 Microempresas obtenidas:', response);
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
  getMicroempresasForPage,
  getMicroempresasByUser,
  getMicroempresas,
  createMicroempresa,
  updateMicroempresa,
};
