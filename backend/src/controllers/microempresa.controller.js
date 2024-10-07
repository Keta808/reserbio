"use strict";

import { respondSuccess, respondError } from "../utils/resHandler.js";
import MicroempresaService from "../services/microempresa.service.js";
import { microempresaBodySchema, microempresaIdSchema } from "../schema/microempresa.schema.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todas las microempresas de la base de datos
 */
async function getMicroempresas(req, res) {
  try {
    const [microempresas, errorMicroempresas] = await MicroempresaService.getMicroempresas();
    if (errorMicroempresas) return respondError(req, res, 404, errorMicroempresas);

    microempresas.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, microempresas);
  } catch (error) {
    handleError(error, "microempresa.controller -> getMicroempresas");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea una nueva microempresa en la base de datos
 * @param {Object} req Objeto de solicitud
 * @param {Object} res Objeto de respuesta
 */
async function createMicroempresa(req, res) {
  try {
    const { error } = microempresaBodySchema.validate(req.body);
    if (error) return respondError(req, res, 400, error.message);

    const [newMicroempresa, errorMicroempresa] = await MicroempresaService
    .createMicroempresa(req.body);
    if (errorMicroempresa) return respondError(req, res, 400, errorMicroempresa);

    respondSuccess(req, res, 201, newMicroempresa);
  } catch (error) {
    handleError(error, "microempresa.controller -> createMicroempresa");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Obtiene una microempresa por su id en la base de datos
 */
async function getMicroempresaById(req, res) {
  try {
    const { error } = microempresaIdSchema.validate(req.params);
    if (error) return respondError(req, res, 400, error.message);

    const [microempresa, errorMicroempresa] = await MicroempresaService
    .getMicroempresaById(req.params.id);
    if (errorMicroempresa) return respondError(req, res, 404, errorMicroempresa);

    respondSuccess(req, res, 200, microempresa);
  } catch (error) {
    handleError(error, "microempresa.controller -> getMicroempresaById");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Actualiza una microempresa en la base de datos por su id
 */
async function updateMicroempresaById(req, res) {
    try {
        const { id } = req.params;
        const { body } = req;
        const { error: idError } = microempresaIdSchema.validate({ id });
        if (idError) return respondError(req, res, 400, idError.message);

        const [microempresa, errorMicroempresa] = await MicroempresaService
        .updateMicroempresaById(id, body);
        if (errorMicroempresa) return respondError(req, res, 404, errorMicroempresa);
        if (!microempresa) return respondError(res, 404, "La microempresa no existe");
        return respondSuccess(req, res, 200, microempresa);
    } catch (error) {
        handleError(error, "microempresa.controller -> updateMicroempresaById");
        return respondError(req, res, 400, error.message);
    }
}

/**
 * Elimina una microempresa en la base de datos por su id
 */
async function deleteMicroempresaById(req, res) {
    try {
        const { error } = microempresaIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const [microempresa, errorMicroempresa] = await MicroempresaService
        .deleteMicroempresaById(req.params.id);
        if (errorMicroempresa) return respondError(req, res, 404, errorMicroempresa);

        respondSuccess(req, res, 200, microempresa);
    } catch (error) {
        handleError(error, "microempresa.controller -> deleteMicroempresaById");
        respondError(req, res, 400, error.message);
    }
}

export default {
    getMicroempresas,
    createMicroempresa,
    getMicroempresaById,
    updateMicroempresaById,
    deleteMicroempresaById,
};
