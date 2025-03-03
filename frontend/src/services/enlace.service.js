import instance from './root.services.js';

/**
 * Actualizar el estado de un enlace (desvincular o volver a activar un trabajador)
 * @param {string} idEnlace - ID del enlace
 * @param {boolean} nuevoEstado - Nuevo estado del enlace (true para activar, false para desactivar)
 * @returns {Promise} - Respuesta de la API
 */
async function actualizarEstadoEnlace(enlaceId, data) {
    try {
        console.log("🔄 Enviando solicitud de actualización:", data);
        const response = await instance.put(`/enlaces/update/${enlaceId}`, data);
        console.log("✅ Enlace actualizado correctamente:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al actualizar el enlace:", error.response?.data || error.message);
        throw error;
    }
}

/**
 * Obtener trabajadores activos de una microempresa
 * @param {string} idMicroempresa - ID de la microempresa
 * @returns {Promise} - Lista de trabajadores vinculados
 */
async function obtenerTrabajadoresMicroempresa(idMicroempresa) {
    try {
        const response = await instance.get(`/enlaces/microempresa/${idMicroempresa}`);
        console.log('📋 Trabajadores obtenidos:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener trabajadores de la microempresa:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Desvincular trabajador de una microempresa
 * @param {string} enlaceId - ID del enlace a desactivar
 * @returns {Promise} - Respuesta de la API
 */
async function desvincularTrabajador(enlaceId) {
    try {
        console.log("🚨 Solicitando desvinculación del trabajador con enlace ID:", enlaceId);
        const response = await instance.delete(`/enlaces/desvincular/${enlaceId}`);
        console.log("✅ Trabajador desvinculado correctamente:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al desvincular trabajador:", error.response?.data || error.message);
        throw error;
    }
}

async function obtenerEnlacesPorTrabajador(userId) {
    try {
        const response = await instance.get(`/enlaces/microempresas/${userId}`);
        console.log('📋 Enlaces obtenidos:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener enlaces para el trabajador:', error.response?.data || error.message);
        throw error;
    }
}

export default {
    actualizarEstadoEnlace,
    obtenerTrabajadoresMicroempresa,
    desvincularTrabajador,
    obtenerEnlacesPorTrabajador,
};

