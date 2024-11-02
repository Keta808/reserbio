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
        enum: ["activa", "cancelada"],
        default: "activa",
    },
    fecha_inicio: {
        type: Date,
        required: true,
    },
    fecha_fin: {
        type: Date,
        required: true,
    },
    MercadoId: String, // ID de la suscripción generada por Mercado Pago
}, { timestamps: true });

const Suscripcion = mongoose.model("Suscripcion", suscripcionSchema);
export default Suscripcion; 
