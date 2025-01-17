/* eslint-disable space-before-blocks */
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
        const { tipoPlan, cardTokenId } = req.body;
        const user = req.user;
        console.log("User:", user);
        console.log("Plan:", tipoPlan);
        console.log("Card Token ID:", cardTokenId);

        // Crear suscripción
        const [suscripcion, errorSuscripcion] = await suscripcionService.crearSuscripcion(tipoPlan, user, cardTokenId);
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
// eslint-disable-next-line no-unused-vars
async function sincronizarEstados(){
    try {
        await suscripcionService.sincronizarEstados();
    // eslint-disable-next-line keyword-spacing
    }catch(error){
        handleError(error, "suscripcion.controller -> sincronizarEstados");
    }
} 

async function getIssuers(req, res) {
    try {
        const paymentMethodId = "visa";  
        // Llamada al servicio para obtener emisores
        const emisores = await suscripcionService.getIssuers(paymentMethodId);
        if (!emisores || emisores.length === 0) {
            return res.status(404).json({ error: "No se encontraron emisores disponibles" });
        } 
        return res.status(200).json(emisores); 
    } catch (error) {
        console.error(`Error en obtenerEmisores:`, error.message);
        return res.status(500).json({ error: "Error al obtener emisores" });
    }
}
async function getIdentificationTypes(req, res) {
    try {
        // Llamada al servicio para obtener tipos de identificación
        const identificationTypes = await suscripcionService.getIdentificationTypes();
        if (!identificationTypes || identificationTypes.length === 0) {
            return res.status(404).json({ error: "No se encontraron tipos de identificación disponibles" });
        } 
        return res.status(200).json(identificationTypes); 
    } catch (error) {
        console.error(`Error en obtenerTiposIdentificacion:`, error.message);
        return res.status(500).json({ error: "Error al obtener tipos de identificación" });
    }
} 

async function cardForm(req, res) {
    try {
        const paymentData = req.body; 
        console.log("Datos recibidos en el controller:", paymentData);
        // Llamada al servicio para generar cardTokenId
        const cardTokenId = await suscripcionService.cardForm(paymentData);
        return res.status(200).json({ cardTokenId }); 
    } catch (error) {
        console.error(`Error en generarCardTokenId:`, error.message);
        return res.status(500).json({ error: "Error al generar cardTokenId" });
    }
}
export default { 
    crearSuscripcion, 
    getSuscripciones, 
    getSuscripcion, 
    deleteSuscripcion, 
    updateSuscripcion, 
    sincronizarEstados,
    getIssuers,
    getIdentificationTypes,
    cardForm,
};
