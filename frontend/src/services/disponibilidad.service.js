import instance from './root.services.js'; 

async function getDisponibilidadByTrabajadorId(trabajadorId){
    try{
        const response = await instance.get(`/disponibilidad/${trabajadorId}`);
        return response.data;
    }catch(error){
        console.error('Error al obtener la disponibilidad:', error.response?.data || error.message);
        throw error;
    }
}

async function createDisponibilidad(data){
    try{
        const response = await instance.post('/disponibilidad', data);
        return response.data;
    }catch(error){
        console.error('Error al crear la disponibilidad:', error.response?.data || error.message);
        throw error;
    }
}

async function updateDisponibilidad(id, data){
    try{
        const response = await instance.put(`/disponibilidad/${id}`, data);
        return response.data;
    }catch(error){
        console.error('Error al actualizar la disponibilidad:', error.response?.data || error.message);
        throw error;
    }
}

async function deleteDisponibilidad(id){
    try{
        const response = await instance.delete(`/disponibilidad/${id}`);
        return response.data;
    }catch(error){
        console.error('Error al eliminar la disponibilidad:', error.response?.data || error.message);
        throw error;
    }
}

async function getHorariosDisponibles(data){
    try{
        const response = await instance.post('/disponibilidad/horarios-disponibles', data);
        return response.data;
    }catch(error){
        console.error('Error al obtener los horarios disponibles:', error.response?.data || error.message);
        throw error;
    }
}

async function getHorariosDisponiblesMicroEmpresa(data){
    try{
        const response = await instance.post('/disponibilidad/horarios-microempresa', data);
        return response.data;
    }catch(error){
        console.error('Error al obtener los horarios disponibles de la microempresa:', error.response?.data || error.message);
        throw error;
    }
}

async function getTrabajadoresDisponiblesPorHora(data){
    try{
        const response = await instance.post('/disponibilidad/disponibilidad/por-hora', data);
        return response.data;
    }catch(error){
        console.error('Error al obtener los trabajadores disponibles por hora:', error.response?.data || error.message);
        throw error;
    }
}

async function getDiasSinHorario(workerId) {
    try {
      const response = await instance.post('/disponibilidad/disponibilidad/por-dia', { workerId });
      console.log('Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los días sin horario:', error.response?.data || error.message);
      throw error;
    }
  }
  
  


export default {
    getDisponibilidadByTrabajadorId,
    createDisponibilidad,
    updateDisponibilidad,
    deleteDisponibilidad,
    getHorariosDisponibles,
    getHorariosDisponiblesMicroEmpresa,
    getTrabajadoresDisponiblesPorHora,
    getDiasSinHorario,
};
