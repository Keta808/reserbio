/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import Suscripcion from "../models/suscripcion.model.js";
import Microempresa from "../models/microempresa.model.js";
import { respondError } from "../utils/resHandler.js";
// Middleware para verificar si Tiene suscripcion 
async function verificarSuscripcion(req, res, next) {
    try {
        const user = req.user; // Usuario autenticado.

        // Verificar si es un Trabajador
        if (user.kind !== "Trabajador") {
            return respondError(res, "Solo los Trabajadores pueden crear microempresas.", 403);
        }

        // Verificar si ya tiene una microempresa registrada
        const microempresaExistente = await Microempresa.findOne({ idTrabajador: user._id });
        if (microempresaExistente) {
            return respondError(res, "Ya tienes una microempresa registrada.", 400);
        }

        // Verificar suscripción activa
        const suscripcionActiva = await Suscripcion.findOne({
            idMicroempresa: user._id, // Aquí usas el ID del usuario dueño.
            estado: "activo",
        });

        if (!suscripcionActiva) {
            return respondError(res, "Debes tener una suscripción activa para crear una microempresa.", 403);
        }

        // Pasar el ID de la suscripción al controlador
        req.suscripcionId = suscripcionActiva._id;
        next();
    } catch (error) {
        console.error("Error en verificarSuscripcion:", error);
        return respondError(res, "Error al verificar la suscripción.", 500);
    }
} 
// Middleware para verificar Tipo de plan suscrito

export default verificarSuscripcion;
