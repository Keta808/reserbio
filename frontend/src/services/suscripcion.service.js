import instance from './root.services.js'; 

async function crearSuscripcion(tipoPlan, user, cardTokenId){
   try{
    const response = await instance.post('/suscripcion/obtener-suscripcion',{
        tipoPlan,
        user,
        cardTokenId,
    });
    return response.data;
   }catch (error) {
    console.error('Error al crear la suscripción:', error.response?.data || error.message);
    throw error;
  }
} 
async function obtenerSuscripciones() {
    try {
      const response = await instance.get('/suscripciones');
      return response.data;
    } catch (error) {
      console.error('Error al obtener las suscripciones:', error.response?.data || error.message);
      throw error;
    }
} 
async function obtenerSuscripcion(id) {
    try {
      const response = await instance.get(`/suscripcion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la suscripción con ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
} 
async function actualizarSuscripcion(id, data) {
    try {
      const response = await instance.put(`/suscripcion/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la suscripción con ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

async function obtenerPlanes(){
    try{
        const response = await instance.get('/planes/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los planes:', error.response?.data || error.message);
        throw error;
    }
}

async function cancelarSuscripcion(id) {
    try {
      const response = await instance.delete(`/suscripcion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al cancelar la suscripción con ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
}

async function getIssuers() {
    try {
      const response = await instance.get('/suscripcion/emisoras');
      return response.data;
    }catch (error) {
      console.error('Error al obtener las emisoras:', error.response?.data || error.message);
      throw error;
    }
} 
async function getIdentificationTypes() {
    try {
      const response = await instance.get('/suscripcion/Id-Types');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de identificación:', error.response?.data || error.message);
      throw error;
    }
}
      
async function cardForm(paymentData) {
    try {
      const response = await instance.post('/suscripcion/cardForm', paymentData);
      return response;
    } catch (error) {
      console.error('Error al generar el cardTokenId:', error.response?.data || error.message);
      throw error;
    }
}

export {crearSuscripcion, obtenerPlanes, cancelarSuscripcion, obtenerSuscripciones, obtenerSuscripcion, actualizarSuscripcion, getIssuers, getIdentificationTypes, cardForm};