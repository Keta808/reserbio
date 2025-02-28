import { mongoose } from "mongoose";

const paymentSchema = new mongoose.Schema({
    idMicroempresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Microempresa",
        required: true,
    }, 
    paymentId: {
        type: String,
        unique: true,
        required: true,
    }, 
    monto: 
    {
        type: Number,
        required: true,
    }, 
    state: {
        type: String,
        enum: ["pending", "approved", "rejected", "refunded"],
        required: true,
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true,
    },
}); 
const Payment = mongoose.model("Payment", paymentSchema); 
export default Payment;
