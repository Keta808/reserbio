import instance from './root.services.js';

// Obtener horarios por ID de trabajador

async function getHorarioByTrabajadorId(trabajadorId){
    try{
        const response = await instance.get(`/horarios/trabajador/${trabajadorId}`);
        console.log('Horario:', response.data);
        return response.data;
    }catch(error){
        console.error('Error al obtener el horario:', error.response?.data || error.message);
        throw error;
    }
}

// Obtener días sin horarios del trabajador
async function getDiasSinHorario(trabajadorId) {
    try {
      const response = await instance.get(`/horarios/trabajador/${trabajadorId}/dias-sin-horario`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener días sin horario:', error.response?.data || error.message);
      throw error;
    }
  }


// Obtener horas disponibles del trabajador
async function getHorasDisponibles({ trabajadorId, fecha, duracion }) {

  try {
    const response = await instance.get(
      `/horarios/trabajador/${trabajadorId}/horas-disponibles`, 
      {
        params: { fecha, duracion }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener horas disponibles:', error.response?.data || error.message);
    throw error;
  }
}




// Obtener disponibilidad de microempresa
async function getHorariosMicroEmpresa({serviceId, date}) {
    try {
      const response = await instance.get('/horarios/disponibilidad-microempresa',
         {
        params: { serviceId, date }
      }
    );
      return response.data;
    } catch (error) {
      console.error('Error al obtener la disponibilidad de la microempresa:', error.response?.data || error.message);
      throw error;
    }
  }

// Actualizar bloques de un día

async function updateBloquesByDia(trabajadorId, dia, nuevosBloques) {
    try {
     
      const response = await instance.put('/horarios/actualizar-bloques', {
        trabajador: trabajadorId,
        dia,
        bloques: nuevosBloques,
      });
    
      return response.data;
    } catch (error) {
      console.error('Error al actualizar los bloques:', error.response?.data || error.message);
      throw error;
    }
  }
  


// Crear un nuevo horario
async function createHorario(data) {
    try {
      const response = await instance.post('/horarios', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear el horario:', error.response?.data || error.message);
      throw error;
    }
  }
  
  // Eliminar horario por ID
  async function deleteHorarioById(horarioId) {
    try {
      const response = await instance.delete(`/horarios/${horarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el horario:', error.response?.data || error.message);
      throw error;
    }
  }

  export default {
    getHorarioByTrabajadorId,
    getDiasSinHorario,
    getHorasDisponibles,
    getHorariosMicroEmpresa,
    updateBloquesByDia,
    createHorario,
    deleteHorarioById
  };
