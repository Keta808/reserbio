import mongoose from "mongoose";

const suscripcionSchema = new mongoose.Schema({
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    idPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    estado: {
        type: String,
        enum: ["activa", "cancelada", "expirada"],
        default: "activa",
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
