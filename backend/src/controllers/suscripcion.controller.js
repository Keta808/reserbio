/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
import suscripcionService from '../services/suscripcion.service.js';    
import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js"; 
import { suscripcionBodySchema, suscripcionIdSchema } from "../schema/suscripcion.schema.js";

async function crearSuscripcion(req, res) {
    try {
        // Validar el cuerpo de la solicitud
        const { error } = suscripcionBodySchema.validate(req.body);
        if (error) return respondError(res, error.message, 400);

        // Crear suscripción
        const [suscripcion, errorSuscripcion] = await suscripcionService.crearSuscripcion(req.body);
        if (errorSuscripcion) return respondError(res, errorSuscripcion, 400);

        return respondSuccess(res, suscripcion, 201);
    } catch (error) {
        handleError(error, "suscripcion.controller -> crearSuscripcion");
        return respondError(res, "Error al crear la suscripción.", 500);
    }
}

async function getSuscripciones(req, res) {
    try {
        const [suscripciones, error] = await suscripcionService.getSuscripciones();
        if (error) return respondError(res, error, 400);

        return respondSuccess(res, suscripciones, 200);
    } catch (error) {
        handleError(error, "suscripcion.controller -> getSuscripciones");
        return respondError(res, "Error al obtener las suscripciones.", 500);
    }
}

async function getSuscripcion(req, res) {
    try {
        // Validar el ID de la suscripción
        const { error } = suscripcionIdSchema.validate(req.params.id);
        if (error) return respondError(res, error.message, 400);

        const [suscripcion, errorSuscripcion] = await suscripcionService.getSuscripcion(req.params.id);
        if (errorSuscripcion) return respondError(res, errorSuscripcion, 404);

        return respondSuccess(res, suscripcion, 200);
    } catch (error) {
        handleError(error, "suscripcion.controller -> getSuscripcion");
        return respondError(res, "Error al obtener la suscripción.", 500);
    }
}

async function deleteSuscripcion(req, res) {
    try {
        // Validar el ID de la suscripción
        const { error } = suscripcionIdSchema.validate(req.params.id);
        if (error) return respondError(res, error.message, 400);

        const [suscripcion, errorSuscripcion] = await suscripcionService.deleteSuscripcion(req.params.id);
        if (errorSuscripcion) return respondError(res, errorSuscripcion, 404);

        return respondSuccess(res, suscripcion, 200);
    } catch (error) {
        handleError(error, "suscripcion.controller -> deleteSuscripcion");
        return respondError(res, "Error al eliminar la suscripción.", 500);
    }
}

async function updateSuscripcion(req, res) {
    try {
        // Validar el ID de la suscripción
        const { error: idError } = suscripcionIdSchema.validate(req.params.id);
        if (idError) return respondError(res, idError.message, 400);

        // Validar el cuerpo de la solicitud
        const { error: bodyError } = suscripcionBodySchema.validate(req.body);
        if (bodyError) return respondError(res, bodyError.message, 400);

        const [suscripcion, errorSuscripcion] = await suscripcionService.updateSuscripcion(req.params.id, req.body);
        if (errorSuscripcion) return respondError(res, errorSuscripcion, 404);

        return respondSuccess(res, suscripcion, 200);
    } catch (error) {
        handleError(error, "suscripcion.controller -> updateSuscripcion");
        return respondError(res, "Error al actualizar la suscripción.", 500);
    }
}

export default { 
    crearSuscripcion, 
    getSuscripciones, 
    getSuscripcion, 
    deleteSuscripcion, 
    updateSuscripcion, 
};
