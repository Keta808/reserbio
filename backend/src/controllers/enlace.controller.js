"use strict";

import { respondSuccess, respondError } from "../utils/resHandler.js";
import EnlaceService from "../services/enlace.service.js";
import { enlaceBodySchema, enlaceIdSchema } from "../schema/enlace.schema.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * 
 * Obtiene todos los enlaces de la base de datos
 */
async function getEnlaces(req, res) {
    try {
        const [enlaces, errorEnlaces] = await EnlaceService.getEnlaces();
        if (errorEnlaces) return respondError(req, res, 404, errorEnlaces);

        enlaces.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, enlaces);
    } catch (error) {
        handleError(error, "enlace.controller -> getEnlaces");
        respondError(req, res, 400, error.message);
    }
}

/**
 * Crea un nuevo enlace en la base de datos
 * 
 * @param {Object} req Objeto de solicitud
 * @param {Object} res Objeto de respuesta
 */

async function createEnlace(req, res) {
    try {
        const { error } = enlaceBodySchema.validate(req.body);
        if (error) return respondError(req, res, 400, error.message);

        const [newEnlace, errorEnlace] = await EnlaceService.createEnlace(req.body);
        if (errorEnlace) return respondError(req, res, 400, errorEnlace);

        respondSuccess(req, res, 201, newEnlace);
    } catch (error) {
        handleError(error, "enlace.controller -> createEnlace");
        respondError(req, res, 400, error.message);
    }
}

/**
 * Elimina un enlace de la base de datos
 * 
 * @param {Object} req Objeto de solicitud
 * @param {Object} res Objeto de respuesta
 */

async function deleteEnlace(req, res) {
    try {
        const { error } = enlaceIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const [enlace, errorEnlace] = await EnlaceService.deleteEnlace(req.params.id);
        if (errorEnlace) return respondError(req, res, 404, errorEnlace);

        respondSuccess(req, res, 200, enlace);
    } catch (error) {
        handleError(error, "enlace.controller -> deleteEnlace");
        respondError(req, res, 400, error.message);
    }
}

/**
 * Actualiza un enlace de la base de datos
 * 
 * @param {Object} req Objeto de solicitud
 * @param {Object} res Objeto de respuesta
 */


async function updateEnlace(req, res) {
    try {
        const { error } = enlaceIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const { error: errorBody } = enlaceBodySchema.validate(req.body);
        if (errorBody) return respondError(req, res, 400, errorBody.message);

        const [enlace, errorEnlace] = await EnlaceService.updateEnlace(req.params.id, req.body);
        if (errorEnlace) return respondError(req, res, 404, errorEnlace);

        respondSuccess(req, res, 200, enlace);
    } catch (error) {
        handleError(error, "enlace.controller -> updateEnlace");
        respondError(req, res, 400, error.message);
    }

}

export default { getEnlaces, createEnlace, deleteEnlace, updateEnlace };
