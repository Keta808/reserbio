"use strict";

import { respondSuccess, respondError } from "../utils/resHandler.js";
import DisponibilidadService from "../services/disponibilidad.service.js";
import { handleError } from "../utils/errorHandler.js";
import { disponibilidadBodySchema, disponibilidadIdSchema } from "../schema/disponibilidad.schema.js";

/**
 * 
 * Obtiene la disponibilidad de un trabajador por su id
 */

async function getDisponibilidadByTrabajador(req, res) {
  try {
    const { error } = disponibilidadIdSchema.validate(req.params);
    if (error) return respondError(req, res, 400, error.message);

    const [disponibilidad, errorDisponibilidad] = await DisponibilidadService.getDisponibilidadByTrabajador(
      req.params.id
    );
    if (errorDisponibilidad) return respondError(req, res, 404, errorDisponibilidad);

    respondSuccess(req, res, 200, disponibilidad);
  } catch (error) {
    handleError(error, "disponibilidad.controller -> getDisponibilidadByTrabajador");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea una nueva disponibilidad en la base de datos
 * 
 * @param {Object} req Objeto de solicitud
 * @param {Object} res Objeto de respuesta
 */

async function createDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadBodySchema.validate(req.body);
    if (error) return respondError(req, res, 400, error.message);

    const [newDisponibilidad, errorDisponibilidad] = await DisponibilidadService.createDisponibilidad(req.body);
    if (errorDisponibilidad) return respondError(req, res, 400, errorDisponibilidad);

    respondSuccess(req, res, 201, newDisponibilidad);
  } catch (error) {
    handleError(error, "disponibilidad.controller -> createDisponibilidad");
    respondError(req, res, 400, error.message);
  }

}


/**
 * Actualiza la disponibilidad de un trabajador
 */

async function updateDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadIdSchema.validate(req.params);
    if (error) return respondError(req, res, 400, error.message);

    const { error: errorBody } = disponibilidadBodySchema.validate(req.body);
    if (errorBody) return respondError(req, res, 400, errorBody.message);

    const [updatedDisponibilidad, errorDisponibilidad] = await DisponibilidadService.updateDisponibilidad(
      req.params.id,
      req.body
    );
    if (errorDisponibilidad) return respondError(req, res, 404, errorDisponibilidad);

    respondSuccess(req, res, 200, updatedDisponibilidad);
  } catch (error) {
    handleError(error, "disponibilidad.controller -> updateDisponibilidad");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Elimina la disponibilidad de un trabajador
 * 
 */

async function deleteDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadIdSchema.validate(req.params);
    if (error) return respondError(req, res, 400, error.message);

    const [disponibilidad, errorDisponibilidad] = await DisponibilidadService.deleteDisponibilidad(req.params.id);
    if (errorDisponibilidad) return respondError(req, res, 404, errorDisponibilidad);

    respondSuccess(req, res, 200, disponibilidad);
  } catch (error) {
    handleError(error, "disponibilidad.controller -> deleteDisponibilidad");
    respondError(req, res, 400, error.message);
  }
}


export default { 
    getDisponibilidadByTrabajador, 
    createDisponibilidad, 
    updateDisponibilidad, 
    deleteDisponibilidad,
 };