/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
"use strict";

import { respondSuccess, respondError } from "../utils/resHandler.js";
import planService from "../services/plan.service.js";
import { planBodySchema, planIdSchema } from "../schema/plan.schema.js";
import { handleError } from "../utils/errorHandler.js";

async function getPlanes(req, res) {
    try {
        const [planes, errorPlanes] = await planService.getPlanes();
        if (errorPlanes) return respondError(req, res, 404, errorPlanes);

        planes.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, planes);
    } catch (error) {
        handleError(error, "plan.controller -> getPlanes");
        respondError(req, res, 400, error.message);
    }
}
async function createPlan(req, res) {
    try {
        // Validar el cuerpo de la petición
        const { error } = planBodySchema.validate(req.body);
        if (error) return respondError(req, res, 400, error.message);

        // Crear el plan y pasar el usuario (trabajador) autenticado
        const [newPlan, errorPlan] = await planService.createPlan(req.body, req.user);
        if (errorPlan) return respondError(req, res, 400, errorPlan);

        respondSuccess(req, res, 201, newPlan);
    } catch (error) {
        handleError(error, "plan.controller -> createPlan");
        respondError(req, res, 400, error.message);
    }
}

async function deletePlan(req, res) {
    try {
        const { error } = planIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const [plan, errorPlan] = await planService.deletePlan(req.params.id);
        if (errorPlan) return respondError(req, res, 400, errorPlan);

        respondSuccess(req, res, 200, plan);
    } catch (error) {
        handleError(error, "plan.controller -> deletePlan");
        respondError(req, res, 400, error.message);
    }
}

async function updatePlan(req, res) {
    try {
        const { error } = planIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);
        const { error: errorBody } = planBodySchema.validate(req.body);
        if (errorBody) return respondError(req, res, 400, errorBody.message);
        const [updatedPlan, errorPlan] = await planService.updatePlan(req.params.id, req.body);
        if (errorPlan) return respondError(req, res, 400, errorPlan);
        respondSuccess(req, res, 200, updatedPlan);
    } catch (error) {
        handleError(error, "plan.controller -> updatePlan");
        respondError(req, res, 400, error.message);
    }
}

async function crearPlanBasico(req, res) {
    try {
        const response = await planService.crearPlanBasico();
        respondSuccess(req, res, 201, response);
    } catch (error) {
        handleError(error, "plan.controller -> crearPlanBasico");
        respondError(req, res, 500, "Error al crear plan básico.");
    }
}
async function crearPlanPremium(req, res) {
    try {
        const response = await planService.crearPlanPremium();
        respondSuccess(req, res, 201, response);
    } catch (error) {
        handleError(error, "plan.controller -> crearPlanPremium");
        respondError(req, res, 500, "Error al crear plan premium.");
    }
}

async function crearPlanGratuito(req, res) {
    try {
        const response = await planService.crearPlanGratuito();
        respondSuccess(req, res, 201, response);
    } catch (error) {
        handleError(error, "plan.controller -> crearPlanGratuito");
        respondError(req, res, 500, "Error al crear plan gratuito.");
    }
}
export default { getPlanes, createPlan, deletePlan, updatePlan, crearPlanBasico, crearPlanPremium, crearPlanGratuito };
