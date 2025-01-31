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
   // console.log('📋 Microempresas obtenidas:', response.data); // Opcional: para debug
    return response.data; // Devuelve las microempresas
  } catch (error) {
    console.error('❌ Error al obtener las microempresas:', error.response?.data || error.message);
    throw error;
  }
}

async function getMicroempresaFotoPerfil(id) {
  try {
      console.log(`🔍 Solicitando foto de perfil para microempresa con ID: ${id}`);

      const response = await instance.get(`/microempresas/fotoPerfil/${id}`);

      if (!response.data || !response.data.fotoPerfil) {
          console.warn("⚠️ La respuesta del backend no contiene fotoPerfil:", response.data);
          return null;
      }

      console.log("📸 URL de la foto de perfil recibida:", response.data.fotoPerfil);
      return response.data.fotoPerfil;
  } catch (error) {
      console.error(
          "❌ Error al obtener la foto de perfil de la microempresa:",
          error.response?.data || error.message
      );
      return null;
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

async function getMicroempresasPorCategoria(categoria) {
  try {
    const response = await instance.get(`/microempresas/categoria/${categoria}`);
    return response.data.data; // Devuelve solo la lista de microempresas
  } catch (error) {
    console.error("❌ Error al obtener microempresas por categoría:", error.response?.data || error.message);
    return [];
  }
}

export default {
  getMicroempresaData,
  getMicroempresasForPage,
  getMicroempresasByUser,
  getMicroempresas,
  getMicroempresaFotoPerfil,
  createMicroempresa,
  updateMicroempresa,
  getMicroempresasPorCategoria,
};
