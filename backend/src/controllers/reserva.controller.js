import ReservaService from '../services/reserva.service.js'; 
import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";
import { reservaBodySchema, reservaIdSchema } from "../schema/reserva.schema.js";

/*
Get de todas las reservas de la base de datos
*/

async function getReservas(req, res) {
    try {
        const [reservas, errorReservas] = await ReservaService.getReservas();
        if (errorReservas) return respondError(req, res, 404, errorReservas);

        reservas.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, reservas);
    } catch (error) {
        handleError(error, "reserva.controller -> getReservas");
        respondError(req, res, 400, error.message);
    }
}

/*
Get de todas las reservas de la base de datos por id del trabajador
*/

async function getReservasByTrabajador(req, res) {
    try {
        const { error } = reservaIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const [reservas, errorReservas] = await ReservaService.getReservasByTrabajador(req.params.id);
        if (errorReservas) return respondError(req, res, 404, errorReservas);

        reservas.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, reservas);
    } catch (error) {
        handleError(error, "reserva.controller -> getReservasByTrabajador");
        respondError(req, res, 400, error.message);
    }
}

/**
 * Crea una nueva reserva en la base de datos
 * 
 * @param {Object} req Objeto de solicitud
 * @param {Object} res Objeto de respuesta
 */

async function createReserva(req, res) {
    try {
        
        const { error } = reservaBodySchema.validate(req.body);
        if (error) return respondError(req, res, 400, error.message);
        const [newReserva, errorReserva] = await ReservaService.createReserva(req.body);
        if (errorReserva) return respondError(req, res, 400, errorReserva);

        respondSuccess(req, res, 201, newReserva);
    } catch (error) {
        handleError(error, "reserva.controller -> createReserva");
        respondError(req, res, 400, error.message);
    }

}

/**
 * Actualiza una reserva en la base de datos
 * 
 */

async function updateReserva(req, res) {
    try {
        const { error } = reservaIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);
        const { error: errorBody } = reservaBodySchema.validate(req.body);
        if (errorBody) return respondError(req, res, 400, errorBody.message);
        const [updatedReserva, errorReserva] = await ReservaService.updateReserva(req.params.id, req.body);
        if (errorReserva) return respondError(req, res, 400, errorReserva);
        respondSuccess(req, res, 200, updatedReserva);
    } catch (error) {
        handleError(error, "reserva.controller -> updateReserva");
        respondError(req, res, 400, error.message);
    }
}

/**
 * Elimina una reserva de la base de datos
 * 
 */

async function deleteReserva(req, res) {
    try {
        const { error } = reservaIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const [reserva, errorReserva] = await ReservaService.deleteReserva(req.params.id);
        if (errorReserva) return respondError(req, res, 400, errorReserva);

        respondSuccess(req, res, 200, reserva);
    } catch (error) {
        handleError(error, "reserva.controller -> deleteReserva");
        respondError(req, res, 400, error.message);
    }
}

/**
 * Cambia el estado de una reserva a Cancelado
 * 
 * 
 */
async function cancelReserva(req, res) {
    try {
        // Valida el ID con el esquema de validación
        const { error } = reservaIdSchema.validate(req.params);
        if (error) {
            return respondError(req, res, 400, `Error de validación: ${error.message}`);
        }

        // Llama al servicio para cancelar la reserva
        const [reserva, errorReserva] = await ReservaService.cancelReserva(req.params.id);

        // Si hay un error al cancelar la reserva, responde con un mensaje de error
        if (errorReserva) {
            return respondError(req, res, 400, `Error al cancelar la reserva: ${errorReserva}`);
        }

        // Si todo es exitoso, responde con la reserva cancelada
        respondSuccess(req, res, 200, reserva);
    } catch (error) {
        // Manejo de errores generales
        handleError(error, 'reserva.controller -> cancelReserva');
        respondError(req, res, 500, `Error interno del servidor: ${error.message}`);
    }
}

//get reservas cliente

async function getReservasByCliente(req, res) {
    try {
        console.log(req.params);
        const { error } = reservaIdSchema.validate(req.params);
        if (error) return respondError(req, res, 400, error.message);

        const [reservas, errorReservas] = await ReservaService.getReservasByCliente(req.params.id);
        if (errorReservas) return respondError(req, res, 404, errorReservas);

        reservas.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, reservas);
    } catch (error) {
        handleError(error, "reserva.controller -> getReservasByCliente");
        respondError(req, res, 400, error.message);
    }
}


export default { getReservas, getReservasByTrabajador, createReserva ,deleteReserva ,updateReserva, cancelReserva, getReservasByCliente};

