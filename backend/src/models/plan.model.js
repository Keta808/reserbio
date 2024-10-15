"use strict"; 


import mongoose from "mongoose"; 


import planes from "../constants/planes.constants.js";
const PlanSchema = new mongoose.Schema({
    tipo_plan: {
        type: String, 
        enum: planes,
        required: true,
    }, 
    // QUIZAS AGREGAR CONSTANTE PRECIO PLAN
    idTrabajador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    estado: {
        type: String, 
        enum: ["Vigente", "No vigente"],
        required: true,
    },
    fecha_fin: {
        type: Date,
        required: true,
    },

},

    {
        timestamps: true, 
        versionKey: false,
    },
    
);

const Plan = mongoose.model("Plan", PlanSchema);
export default Plan;