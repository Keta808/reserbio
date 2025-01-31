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
export default {
    getReservasByTrabajadorId,
    createReserva,
    deleteReserva,
    cancelReserva,
    getReservasByCliente,
};
