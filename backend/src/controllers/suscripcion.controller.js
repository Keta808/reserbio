/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
import suscripcionService from '../services/suscripcion.service.js';    

 async function iniciarSuscripcion(req, res) {
    const { usuarioId, planId, cardTokenId } = req.body;

    try {
        const response = await suscripcionService.iniciarSuscripcion(usuarioId, planId, cardTokenId);
        res.json(response);
    } catch (error) {
        console.error("Error al iniciar suscripción:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

 async function cancelarSuscripcion(req, res) {
    const { idSuscripcion } = req.body;

    try {
        const response = await suscripcionService.cancelarSuscripcion(idSuscripcion);
        res.json(response);
    } catch (error) {
        console.error("Error al cancelar suscripción:", error);
        res.status(500).json({ success: false, message: error.message });
    }
} 
export default { iniciarSuscripcion, cancelarSuscripcion };
