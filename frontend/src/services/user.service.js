import instance from './root.services.js';  

async function getTrabajadorById(id) {
  try {
    const response = await instance.get(`/users/trabajador/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
} 

async function updateTrabajador(id, data) {
  try {
    const response = await instance.post(`/users/trabajador/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el trabajador con ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * 📌 Registra un nuevo cliente en el sistema
 * @param {Object} data - Datos del cliente (nombre, apellido, email, password, state, telefono)
 * @returns {Promise} - Respuesta del backend
 */
async function registrarCliente(data) {
  try {
    const response = await instance.post(`/users/createcliente`, data);
    console.log("✅ Cliente registrado con éxito:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al registrar cliente:", error.response?.data || error.message);
    throw error;
  }
}
async function getClienteById(id) {
  try {
    const response = await instance.get(`/users/cliente/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function updateCliente(id, data) {
  try {
    const response = await instance.post(`/users/cliente/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el cliente con ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
}


async function changePassword(data) {
  try {
    const response = await instance.post(`/users/changepassword`, data);
    console.log("✅ Contraseña cambiada con éxito:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al cambiar la contraseña:", error.response?.data || error.message);
    throw error;
  }
}

export { getTrabajadorById, updateTrabajador, registrarCliente, getClienteById, updateCliente, changePassword };
