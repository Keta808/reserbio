"use strict";
import mongoose from "mongoose";

const enlaceSchema = new mongoose.Schema(
    {
        id_trabajador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        //modificar el modelo de role.model.js
        id_role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        id_microempresa: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Microempresa",
            required: true,
        },
        fecha_inicio: {
            type: Date,
            required: true,
        },
        estado: {
            type: Boolean,
            required: true,
        },
    }
    );

    const Enlace = mongoose.model("Enlace", enlaceSchema);

    export default Enlace;


