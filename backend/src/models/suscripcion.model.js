import mongoose from "mongoose";

const suscripcionSchema = new mongoose.Schema({
    idMicroempresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Microempresa", 
        required: true,
    },
    idPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    estado: {
        type: String,
        enum: ["pendiente", "activo", "cancelado", "expirado"],
        default: "pendiente",
    },
    fecha_inicio: {
        type: Date,
        default: Date.now,
        required: true,
    },
    fecha_fin: {
        type: Date,
        required: true,
    },
    preapproval_id: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Suscripcion = mongoose.model("Suscripcion", suscripcionSchema);
export default Suscripcion; 
