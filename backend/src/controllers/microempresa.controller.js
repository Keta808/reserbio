/* eslint-disable space-before-blocks */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
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
    // populate para mostrar todos los datos de trabajadores
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
    // Validación de los datos del esquema
    const { error } = microempresaBodySchema.validate(req.body);
    if (error) return respondError(req, res, 400, error.message);

    console.log("Datos recibidos en el backend:", req.body);

    // Llamada al servicio para crear la microempresa
    const [newMicroempresa, errorMicroempresa] = await MicroempresaService
    .createMicroempresa(req.body);

    // Manejar errores del servicio
    if (errorMicroempresa) {
      console.error("Error al crear la microempresa:", errorMicroempresa);
      return respondError(req, res, 400, "No se pudo crear la microempresa.");
    }

    // Responder con la nueva microempresa creada
    respondSuccess(req, res, 201, { _id: newMicroempresa._id, ...newMicroempresa.toObject() });

  } catch (error) {
    // Manejar errores generales
    handleError(error, "microempresa.controller -> createMicroempresa");
    return respondError(req, res, 500, "Error interno del servidor.");
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

// eslint-disable-next-line require-jsdoc, space-before-blocks
async function getMicroempresasPorCategoria(req, res){
    try {
        const { categoria } = req.params;
        // eslint-disable-next-line max-len
        const [microempresas, errorMicroempresas] = await MicroempresaService.getMicroempresasPorCategoria(categoria);
        if (errorMicroempresas) return respondError(req, res, 404, errorMicroempresas);

        microempresas.length === 0
          ? respondSuccess(req, res, 204)
          : respondSuccess(req, res, 200, microempresas);
      } catch (error) {
        handleError(error, "microempresa.controller -> getMicroempresasPorCategoria");
        respondError(req, res, 400, error.message);
      }
}
async function getMicromempresaPorNombre(req, res){
    try {
        const { nombre } = req.params;
        // eslint-disable-next-line max-len
        const [microempresas, errorMicroempresas] = await MicroempresaService.getMicroempresasPorNombre(nombre);
        if (errorMicroempresas) return respondError(req, res, 404, errorMicroempresas);

        microempresas.length === 0
          ? respondSuccess(req, res, 204)
          : respondSuccess(req, res, 200, microempresas);
      } catch (error) {
        handleError(error, "microempresa.controller -> getMicroempresasPorNombre");
        respondError(req, res, 400, error.message);
      }
}

async function getMicroempresasByUser(req, res) {
  try {
    const { trabajadorId } = req.params;
    const microempresas = await MicroempresaService.getMicroempresasByUser(trabajadorId);

    if (!microempresas || microempresas.length === 0) {
      return res.status(404).json({ state: 'Error', message: 'No se encontraron microempresas para este trabajador' });
    }

    res.status(200).json({ state: "Success", data: microempresas });
  } catch (error) {
    res.status(500).json({ state: "Error", message: error.message });
  }
}

export default {
    getMicroempresas,
    createMicroempresa,
    getMicroempresaById,
    updateMicroempresaById,
    deleteMicroempresaById,
    getMicroempresasPorCategoria,
    getMicromempresaPorNombre,
    getMicroempresasByUser,
};
