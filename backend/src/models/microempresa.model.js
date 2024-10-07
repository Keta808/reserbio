"use strict";

import mongoose from "mongoose";
// import UserModels from "../models/user.model.js";
// Extrae el modelo 'User'
// const { Trabajador } = UserModels;

const MicroempresaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,  
    },
    telefono: {
        type: String,
        required: true,
    },
    direccion: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    categoria: {
        type: String,
        required: true,
    },
    idPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: false,
    },
    idTrabajador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Microempresa = mongoose.model("Microempresa", MicroempresaSchema);
export default Microempresa;
