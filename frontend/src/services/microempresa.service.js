import instance from './root.services.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";

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
      throw new Error("El ID de la microempresa es obligatorio.");
    }

    const response = await instance.get(`/microempresas/${idMicroempresa}`);

    if (!response?.data?.data) {
      throw new Error("La respuesta no contiene datos válidos.");
    }

    // Asegurar que tipoPlan siempre tenga un valor antes de devolver la respuesta
    response.data.data.tipoPlan = response.data.data.tipoPlan || "Sin Plan";

    return response.data; // Se mantiene la estructura original
  } catch (error) {
    console.error(
      "❌ Error al obtener los datos de la microempresa:",
      error.response?.data || error.message || error
    );
    throw error;
  }
}

async function getMicroempresas(page = 1, limit = 2, seed) {
  try {
    const params = { page, limit };
    if (seed) params.seed = seed; // Solo agregar 'seed' si tiene valor

    const response = await instance.get(`/microempresas`, { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener las microempresas:", error.response?.data || error.message);
    throw error;
  }
}

async function getMicroempresaFotoPerfil(id) {
  try {
      // console.log(`🔍 Solicitando foto de perfil para microempresa con ID: ${id}`);

      const response = await instance.get(`/microempresas/fotoPerfil/${id}`);

      if (!response.data || !response.data.fotoPerfil) {
          console.warn("⚠️ La respuesta del backend no contiene fotoPerfil:", response.data);
          return null;
      }

      // console.log("📸 URL de la foto de perfil recibida:", response.data.fotoPerfil);
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

async function getMicroempresasByUser(userId) {
  try {
    // ✅ Buscar en `Enlace` las microempresas asociadas al `userId` del trabajador
    const response = await instance.get(`/enlaces/microempresas/${userId}`);
    
    console.log('📦 Microempresas obtenidas por enlaces:', response.data);

    return response.data; 
  } catch (error) {
    console.error('❌ Error al obtener microempresas:', error.response?.data || error.message);
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

const uploadFotoPerfil = async (id, imageUri) => {
  try {
    console.log("📤 Subiendo imagen a la microempresa:", id);

    // ✅ Crear objeto FormData
    const formData = new FormData();
    formData.append("microempresaId", id);
    formData.append("fotoPerfil", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    // ✅ Configurar cabeceras correctamente
    const config = { headers: { "Content-Type": "multipart/form-data" } };

    // ✅ Enviar la solicitud POST al backend con `instance.post`
    const response = await instance.post("/imagenes/fotoPerfil", formData, config);

    console.log("✅ Foto subida con éxito:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al subir la foto de perfil:", error.response?.data || error.message);
    throw new Error("No se pudo subir la imagen.");
  }
};


const pickImage = async () => {
  try {
      // Solicitar permisos explícitamente antes de abrir la galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
          alert("Se necesita permiso para acceder a la galería.");
          return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaType.Images, // Reemplazamos la opción obsoleta
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
      });

      if (!result.canceled) {
          console.log("📸 Imagen seleccionada:", result.assets[0].uri);
          return result.assets[0].uri;
      }
      return null;
  } catch (error) {
      console.error("❌ Error al seleccionar imagen:", error.message);
      return null;
  }
};

/**
 * 📤 Sube múltiples imágenes a la galería de una microempresa
 * @param {string} microempresaId - ID de la microempresa
 * @param {Array} imagenes - Array de imágenes en formato de archivo
 */
async function uploadImagenes(formData) {
  try {
      console.log("📤 FormData final antes de enviar:", formData);
      const response = await instance.post("/imagenes/portafolio", formData, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
      });
      console.log("✅ Respuesta del backend:", response.data);
      return response.data;
  } catch (error) {
      console.error("❌ Error al subir imágenes:", error.response?.data || error.message);
      throw error;
  }
}


/**
* 🗑 Elimina una imagen de la galería de una microempresa
* @param {string} microempresaId - ID de la microempresa
* @param {string} publicId - ID público de la imagen en Cloudinary
*/
async function eliminarImagen(microempresaId, publicId) {
  try {
      console.log("🗑 Eliminando imagen con public_id:", publicId);

      const response = await instance.post("/imagenes/eliminar", {
          microempresaId,
          public_id: publicId,
      });

      console.log("✅ Imagen eliminada correctamente:", response.data);
      return response.data;
  } catch (error) {
      console.error("❌ Error al eliminar imagen:", error.response?.data || error.message);
      throw error;
  }
}


//servicio que retorna SOLO el id de la microempresa por el id de su trabajador

//BORRAR <-> NO SE USA
async function getMicroempresaIdByTrabajadorId(trabajadorId) {
  try {
    const response = await instance.get(`/microempresas/user/${trabajadorId}/id`);
    const idMicroempresa = response.data.data;
    console.log("📡 ID de la microempresa obtenido:", response.data.data);
    return idMicroempresa[0];
  } catch (error) {
    console.error("❌ Error al obtener el ID de la microempresa por trabajador:", error.response?.data || error.message);
    throw error;
  }
} 

async function obtenerMicroempresaPorTrabajador(idTrabajador) { 
  try { 
    const response = await instance.get(`/microempresas/maintrabajador/${idTrabajador}`); 
    return response.data; 
  } catch (error) {
    console.log("Error al obtener la microempresa del main trabajador:", error.response?.data || error.message);
    throw error;
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
  uploadFotoPerfil,
  pickImage,
  uploadImagenes,
  eliminarImagen,
  //-<->- BORRAR -<->-
  getMicroempresaIdByTrabajadorId,
  obtenerMicroempresaPorTrabajador, 
};
