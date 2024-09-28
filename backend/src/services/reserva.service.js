/* eslint-disable keyword-spacing */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */


import Reserva from '../models/reserva.model'; 
import mongoose from 'mongoose'; 
import { reservaBodySchema, reservaIdSchema } from '../schema/reserva.schema';
import { handleError } from "../utils/errorHandler.js"; 

async function getReservas() {
    try {
        const reservas = await Reserva.find()
        .populate('cliente')
        .populate('trabajador')
        .populate('servicio')
        .exec();
        if (!reservas) return [null, "No hay reservas"];
    
        return [reservas, null];
    } catch (error) {
        handleError(error, "reserva.service -> getReservas");
    }
}

async function createReserva(reserva) {
    try {
        const newReserva = new Reserva(reserva); 
        await newReserva.save();
        return [newReserva, null];
    } catch (error) {
        handleError(error, "reserva.service -> createReserva");
    }
}

export { getReservas, createReserva }; 

