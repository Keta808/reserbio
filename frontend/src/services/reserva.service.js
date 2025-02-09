import instance from "./root.services";

async function getReservasByTrabajadorId(trabajadorId) {
    try {
    

        const response = await instance.get(`/reservas/trabajador/${trabajadorId}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas del trabajador:",
        error.response?.data || error.message
        );
        throw error;
    }
    }

async function createReserva(data) {
    try {
        const response = await instance.post("/reservas", data);
        return response.data;
    } catch (error) {
        console.error(
        "Error al crear la reserva:",
        error.response?.data || error.message
        );
        throw error;
    }
}

//eliminar una reserva 

async function deleteReserva(id) {
    try {
        const response = await instance.delete(`/reservas/${id}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al eliminar la reserva:",
        error.response?.data || error.message
        );
        throw error;
    }
}



//cancelar una reserva

async function cancelReserva(id) {
    try {
        const response = await instance.put(`/reservas/cancelar/${id}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al cancelar la reserva:",
        error.response?.data || error.message
        );
        throw error;
    }
}

//get reservas by cliente id

async function getReservasByCliente(clienteId) {
    try {
        const response = await instance.get(`/reservas/cliente/${clienteId}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas del cliente:",
        error.response?.data || error.message
        );
        throw error;
    }
}

// Obtiene las reservas activas para un trabajador en una fecha determinada.

async function getReservasPorFechaTrabajador(workerId, date) {
    try {
    
        const response = await instance.get(`/reservas/horas/trabajador/${workerId}/${date}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas del trabajador en la fecha:",
        error.response?.data || error.message
        );
        throw error;
    }
}

//Obtiene las reservas activas para un trabajador en una fecha determinada.

async function getReservasPorFechaMicroempresa(serviceId, date) {
    try {
        console.log("DATOS QUE LLEGAN A LA FUNCION DE MICROEMPRESA");
        console.log(serviceId, date);
        const response = await instance.get(`/reservas/horas/microempresa/${serviceId}/${date}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas de la microempresa en la fecha:",
        error.response?.data || error.message
        );
        throw error;
    }
}
export default {
    getReservasByTrabajadorId,
    createReserva,
    deleteReserva,
    cancelReserva,
    getReservasByCliente,
    getReservasPorFechaTrabajador,
    getReservasPorFechaMicroempresa

};
