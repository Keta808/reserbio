import instance from "./root.services";

//funcion get servicios por ID microempresa

async function getServiciosByMicroempresaId(microempresaId) {
    try {
        const response = await instance.get(`/servicios/servicios/${microempresaId}`);
        return response.data;
    } catch (error) {
        console.error(
            "Error al obtener los servicios de la microempresa:",
            error.response?.data || error.message
        );
        throw error;
    }
} 
async function getServicios() {
    try {
        const response = await instance.get('servicios/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los servicios:', error.response?.data || error.message);
        throw error;
    }
} 
async function createServicio(servicio) {
    try {
        const response = await instance.post('servicios/', servicio);
        return response.data;
    } catch (error) {
        console.error('Error al crear el servicio:', error.response?.data || error.message);
        throw error;
    }
} 
async function deleteServicio(id) {
    try {
        const response = await instance.delete(`servicios/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el servicio con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}
async function updateServicio(id, servicio) {
    try {
        const response = await instance.put(`servicios/${id}`, servicio);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el servicio con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}
async function getServicioById(id) {
    try {
        const response = await instance.get(`servicios/servicio/${id}`); 
        return response.data.data;
    } catch (error) {
        console.error(`Error al obtener el servicio con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
} 


async function calcularMontoAbono(id, precio, porcentaje) {
    try {
        const response = await instance.post(`servicios/servicios/${id}`, { precio, porcentajeAbono: porcentaje });
        return response.data;
    } catch (error) {
        console.error(`Error al calcular el monto de abono del servicio con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}   

export default { getServiciosByMicroempresaId, getServicios, createServicio, deleteServicio, updateServicio, getServicioById, calcularMontoAbono };    