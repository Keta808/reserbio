/* eslint-disable quotes */
"use strict";

import mongoose from "mongoose"; 

const ServicioSchema = new mongoose.Schema({ 
    idReserva: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserva",
        required: true,
    },
    // añadir id Microempresa Posiblemente segun MER
    nombre: {
        type: String,
        required: true,
    },
    precio: {
        type: Number,
        required: true,
    },
    duracion: {
        type: Number,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    },   
);

const Servicio = mongoose.model("Servicio", ServicioSchema); 
export default Servicio; 
