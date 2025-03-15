import instance from './root.services.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enviar una invitación a un trabajador
 * @param {string} email - Correo electrónico del trabajador a invitar
 * @param {string} idMicroempresa - ID de la microempresa que envía la invitación
 * @returns {Promise} - Respuesta de la API
 */
async function enviarInvitacion(email, idMicroempresa) {
    try {
        const response = await instance.post('/invitaciones/enviar', { email, idMicroempresa });
        console.log('📡 Invitación enviada con éxito:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error al enviar la invitación:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Aceptar una invitación con un código de invitación
 * @param {string} codigoInvitacion - Código de 5-6 dígitos recibido en el correo
 * @returns {Promise} - Respuesta de la API
 */
async function aceptarInvitacion(codigo, userId) {
    try {
        if (!userId) {
            throw new Error("El ID del usuario es requerido.");
        }

        const response = await instance.post(`/invitaciones/aceptar/${codigo}`, { userId });
        return response.data;
    } catch (error) {
        console.error("❌ Error al aceptar la invitación:", error.response?.data || error.message);
        throw error;
    }
}


/**
 * Rechazar una invitación con un código de invitación
 * @param {string} codigoInvitacion - Código de invitación a rechazar
 * @returns {Promise} - Respuesta de la API
 */
async function rechazarInvitacion(codigoInvitacion) {
    try {
        const response = await instance.post('/invitaciones/rechazar', { codigoInvitacion });
        console.log('🚫 Invitación rechazada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error al rechazar la invitación:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Obtener las invitaciones pendientes de una microempresa
 * @param {string} idMicroempresa - ID de la microempresa
 * @returns {Promise} - Lista de invitaciones pendientes
 */
async function obtenerInvitacionesPendientes(idMicroempresa) {
    try {
        if (!idMicroempresa) {
            throw new Error("ID de la microempresa no proporcionado.");
        }

        const response = await instance.get(`/invitaciones/pendientes/${idMicroempresa}`);
        console.log("📋 Invitaciones pendientes obtenidas:", response.data);

        return { success: true, data: response.data };
    } catch (error) {
        console.error("❌ Error al obtener invitaciones pendientes:", error.response?.data || error.message);

        return {
            success: false,
            message: error.response?.data?.message || "Error al obtener invitaciones",
            errorDetails: error.response?.data || error.message,
        };
    }
}

export default {
    enviarInvitacion,
    aceptarInvitacion,
    rechazarInvitacion,
    obtenerInvitacionesPendientes,
};
