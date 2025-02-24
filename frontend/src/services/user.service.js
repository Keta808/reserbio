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



export { getTrabajadorById, updateTrabajador };