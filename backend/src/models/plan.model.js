"use strict"; 


import mongoose from "mongoose"; 


const PlanSchema = new mongoose.Schema({
    tipo_plan: {
        type: String, 
        enum: ["Basico", "Premium"],
        required: true, 
        
    },
    precio: {
        type: Number,
        required: true,
    },
    preapproval_plan_id: {
        type: String, // ID del plan de suscripción en Mercado Pago
        required: true,
        unique: true,
    }, 
    estado: {
        type: String,
        enum: ["activo", "inactivo"],
        default: "activo",
    },
}, { timestamps: true });

const Plan = mongoose.model("Plan", PlanSchema);
export default Plan;
