/* eslint-disable quote-props */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import axios from "axios";
import Payment from "../models/payment.model.js";
import { handleError } from "../utils/errorHandler.js";
// importar mercado pago acc 
import MercadoPagoAcc from "../models/mercadoPago.model.js";

async function createPayment(paymentData) {
    try {
        const { idMicroempresa, paymentId, monto, state, fecha } = paymentData;
        const paymentFound = await Payment.findOne({ paymentId }); 
        if (paymentFound) return [null, "El pago ya existe"]; 
        const newPayment = new Payment(
            {
                idMicroempresa,
             
                paymentId,
                monto,
                state,
                fecha,
            },
        );

        await newPayment.save();
        return [newPayment, null];
    } catch (error) {
        handleError(error, "payment.service -> createPayment");
        return [null, error];
    }
} 
async function getPayments() {
    try {
        const payments = await Payment.find().exec();
        if (!payments) return [null, "No hay pagos"];
        return [payments, null];
    } catch (error) {
        handleError(error, "payment.service -> getPayments");
        return [null, error];
    }   
}

async function getPaymentById(paymentId) {
    try {
        const payment = await Payment.findOne({ paymentId });
        if (!payment) return [null, "El pago no existe"];
        return [payment, null];
    } catch (error) {
        handleError(error, "payment.service -> getPaymentById");
        return [null, error];
    }
}

async function deletePayment(paymentId) {
    try {
        const payment = await Payment.findOneAndDelete({ paymentId });
        if (!payment) return [null, "El pago no existe"];
        return [payment, null];
    } catch (error) {
        handleError(error, "payment.service -> deletePayment");
        return [null, error];
    }
} 

async function updatePayment(paymentId, paymentData) {
    try {
        const payment = await Payment.findOneAndUpdate({ paymentId }, paymentData, { new: true });
        if (!payment) return [null, "El pago no existe"];
        return [payment, null];
    } catch (error) {
        handleError(error, "payment.service -> updatePayment");
        return [null, error];
    }
}
// Service de Webhook 
async function procesarNotificacionPago(paymentId, idMicroempresa) {
    try { 
        if (!paymentId) return [null, "Falta el id del pago"];
        if (!idMicroempresa) return [null, "Falta el id de la microempresa"]; 

        // 1️⃣ Obtener el `accessToken` de la microempresa
        const mercadoPagoAcc = await MercadoPagoAcc.findOne({ idMicroempresa });
        if (!mercadoPagoAcc || !mercadoPagoAcc.accessToken) {
            return [null, "No hay cuenta de MercadoPago vinculada a esta microempresa"];
        }
        const accessToken = mercadoPagoAcc.accessToken;
        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        
        }); 
        console.log(response.data);
        const paymentData = response.data;
        if (!paymentData) return [null, "No se pudo obtener la información del pago"];
        console.log("PAYMENT DATA", paymentData);
        const paymentFound = await Payment.findOne({ paymentId }); 
        if (paymentFound) return [null, "El pago ya existe"];  
        const newPayment = new Payment(
            {
                idMicroempresa,
                paymentId: paymentData.id,
                monto: paymentData.transaction_amount,
                state: paymentData.status,
                fecha: new Date(paymentData.date_created),
            },
        );
        await newPayment.save();
        return [newPayment, null];
    } catch (error) {
        handleError(error, "payment.service -> procesarNotificacionPago");
        return [null, error];
    }   
}
// Funcion para refund de pago  

async function refundPayment(paymentId) { 
    try {
        if (!paymentId) return [null, "Falta el id del pago"]; 
        const payment = await Payment.findOne({ paymentId }); 
        if (!payment) return [null, "El pago no existe"]; 
        if (payment.state !== "refunded") return [null, "El pago no está aprobado"]; 

        const mercadoPagoAcc = await MercadoPagoAcc.findOne({ idMicroempresa: payment.idMicroempresa });
        if (!mercadoPagoAcc || !mercadoPagoAcc.accessToken) {
            return [null, "No hay cuenta de MercadoPago vinculada a esta microempresa"];
        } 
        const accessToken = mercadoPagoAcc.accessToken;
        const response = await axios.post(
            `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );
        console.log(response.data);
        if (!response.data) return [null, "No se pudo realizar el reembolso"]; 
        payment.state = "refunded";
        await payment.save();
        console.log(payment); 
        return [payment, null];
    } catch (error) {
        handleError(error, "payment.service -> refundPayment");
        return [null, error];
    }
}

export default { createPayment, getPayments, getPaymentById, deletePayment, updatePayment, procesarNotificacionPago, refundPayment };
