import instance from './root.services.js';  
// createCardMP, getCardByIdMP, getCardByClient, updateCardMP, deleteCardMP 
async function createCardMP(data) {
    try {
        const response = await instance.post('/cards/guardar-tarjeta', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear la tarjeta:', error.response?.data || error.message);
        throw error;
    }
} 
async function getCardByIdMP(id) {
    try {
        const response = await instance.get(`cards/tarjeta/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la tarjeta con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
} 

async function getCardByClient(id, cardId) {
    try {
        const response = await instance.get(`cards/cliente/tarjetaId/${id}/${cardId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la tarjeta con ID ${cardId} del cliente con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}
async function updateCardMP(id, data) {
    try {
        const response = await instance.put(`cards/tarjeta/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar la tarjeta con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
} 
async function deleteCardMP(id) {
    try {
        const response = await instance.delete(`cards/tarjeta/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar la tarjeta con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
} 
export { createCardMP, getCardByIdMP, getCardByClient, updateCardMP, deleteCardMP };