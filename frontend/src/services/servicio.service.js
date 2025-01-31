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

//get servicios por ID 
async function getServicioById(id) {
    try {
        const response = await instance.get(`/servicios/servicio/${id}`);
        console.log("Response recibido:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.error(
            "Error al obtener el servicio:",
            error.response?.data || error.message
        );
        throw error;
    }
}

export default { getServiciosByMicroempresaId, getServicioById };    