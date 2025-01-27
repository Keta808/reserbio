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

export { getTrabajadorById };