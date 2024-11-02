/* eslint-disable max-len */

import mongoose from "mongoose";

const PagoSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            required: true,
        },
        monto: {
            type: Number,
            required: true,
        },
        estado: {
            type: String,
            enum: ["pendiente", "completado", "cancelado"],
            required: true,
        }, 
        tipo_pago: {
            type: String,
            enum: ["Suscripcion", "Abono"],
            required: true,
        },
        idTransaccion: {
            type: String,
            required: true,
            unique: true,
        },
        fecha_pago: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Pago = mongoose.model("Pago", PagoSchema);
export default Pago;
