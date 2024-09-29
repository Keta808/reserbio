/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
/* eslint-disable eol-last */
/* eslint-disable no-unused-vars */
import reservaService from '../services/reserva.service'; 
import { respondError, respondSuccess } from "../utils/respond.js";

async function getReservas(req, res) {
    try {
        const [reservas, error] = await reservaService.getReservas();
        if (error) return respondError(res, 404, error);

        return respondSuccess(res, 200, reservas);
    } catch (error) {
        return respondError(res, 500, error);
    }
} 

async function createReserva(req, res) { 
    try {
        const [newReserva, error] = await reservaService.createReserva(req.body);
        if (error) return respondError(res, 404, error);

        return respondSuccess(res, 201, newReserva);
    } catch (error) {
        return respondError(res, 500, error);
    }
} 

export default { getReservas, createReserva }; 