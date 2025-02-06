import instance from "./root.services";

//get valoraciones por microempresa
async function getValoracionesPorMicroempresa(microempresaId) {
    try {
        const response = await instance.get(`/valoraciones/microempresa/${microempresaId}`);
        return response.data.data;
    } catch (error) {
        console.error(
            "Error al obtener las valoraciones de la microempresa:",
            error.response?.data || error.message
        );
        throw error;
    }
} 

//get valoraciones por trabajador

async function getValoracionesPorTrabajador(trabajadorId) { 
    try {
        const response = await instance.get(`/valoraciones/trabajador/${trabajadorId}`);
        return response.data.data;
    } catch (error) {
        console.error(
            "Error al obtener las valoraciones del trabajador:",
            error.response?.data || error.message
        );
        throw error;
    }
}

//crear valoracion

async function crearValoracion(valoracionData) {
    try {
        const response = await instance.post("/valoraciones", valoracionData); 
        return response.data.data;
    } catch (error) {
        console.error(
            "Error al crear la valoración:",
            error.response?.data || error.message
        );
        throw error;
    }
}


//eliminar valoracion  por id

async function eliminarValoracion(valoracionId) {
    try {
        const response = await instance.delete(`/valoraciones/${valoracionId}`);
        return response.data.data;
    } catch (error) {
        console.error(
            "Error al eliminar la valoración:",
            error.response?.data || error.message
        );
        throw error;
    }
}


//get valoracion promedio por microempresa

async function getValoracionPromedioPorMicroempresa(microempresaId) {
    try {
        const response = await instance.get(`/valoraciones/microempresa/${microempresaId}/promedio`);
        return response.data.data;
    } catch (error) {
        console.error(
            "Error al obtener la valoración promedio de la microempresa:",
            error.response?.data || error.message
        );
        throw error;
    }
}

//verifica si existe una valoracion para un servicio por un cliente

const existeValoracionPorReserva = async (reservaId) => {
    try {
      
      //console.log("reserva id en valoracion a", reservaId);

      const response = await instance.get(`/valoraciones/reserva/${reservaId}`);
     // console.log("response", response.data);
      return response.data; // Retorna `true` si ya está valorado, `false` si no.
    } catch (error) {
      console.error('Error al verificar valoración:', error);
      return false; // En caso de error, asumimos que no tiene valoración
    }
  };
  

export default {
    getValoracionesPorMicroempresa,
    getValoracionesPorTrabajador,
    crearValoracion,
    eliminarValoracion,
    getValoracionPromedioPorMicroempresa,
    existeValoracionPorReserva
};


