import instance from './root.services.js';

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

export default {
    enviarInvitacion,
};
