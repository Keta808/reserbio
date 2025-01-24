import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    }, 
    cardTokenId: {
        type: String,
        required: true,
    },
    lastFourDigits: {
        type: String,
        required: true,
    },
    paymenthMethod: {
        type: String,
        required: true,
    },
    expirationDate: {
        type: String,
        required: true,
    }, 
});

const Card = mongoose.model("Card", cardSchema); 
export default Card; 

