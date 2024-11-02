/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable require-jsdoc */
import Suscripcion from '../models/suscripcion.model.js';
import Plan from '../models/plan.model.js'; 
import User from "../models/user.model.js";
import { ACCESS_TOKEN } from '../config/configEnv.js';
 async function iniciarSuscripcion(req, res) {
    const { usuarioId, planId, cardTokenId } = req.body;

    try {
        const plan = await Plan.findById(planId);
        const usuario = await User.findById(usuarioId).exec();
        const payerEmail = usuario.email;

        const suscripcionData = {
            preapproval_plan_id: plan.preapproval_plan_id,
            reason: `Suscripción a ${plan.tipo_plan}`,
            external_reference: `SUB-${usuarioId}-${planId}`,
            payer_email: payerEmail, // Cambia esto por el email real del cliente
            card_token_id: cardTokenId,
            auto_recurring: {
                frequency: 1,
                frequency_type: 'months',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 12 meses
                transaction_amount: plan.precio,
                currency_id: 'CLP',
                back_url: 'http://localhost:3000/api/pagos/pago-exitoso',
                status: 'authorized'
            }
        };

        const response = await axios.post('https://api.mercadopago.com/preapproval', suscripcionData, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Guardar la suscripción en la base de datos
        const nuevaSuscripcion = await Suscripcion.create({
            idUsuario: usuarioId,
            idPlan: planId,
            estado: 'activa',
            fecha_inicio: new Date(),
            fecha_fin: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // Fecha de finalización
            MercadoId: response.data.id, // ID de la suscripción generada
        });

        res.json({ success: true, subscription: nuevaSuscripcion });
    } catch (error) {
        console.error("Error al iniciar suscripción:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
 async function cancelarSuscripcion(req, res) {
    const { idSuscripcion } = req.body;

    try {
        const suscripcion = await Suscripcion.findById(idSuscripcion);

        // Llama a la API de Mercado Pago para cancelar la suscripción
        await axios.put(`https://api.mercadopago.com/preapproval/${suscripcion.MercadoId}`, { status: 'cancelled' }, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Actualiza el estado de la suscripción en la base de datos
        suscripcion.estado = 'cancelada';
        await suscripcion.save();

        res.json({ success: true, message: "Suscripción cancelada." });
    } catch (error) {
        console.error("Error al cancelar suscripción:", error);
        res.status(500).json({ success: false, message: error.message });
    }
} 
export default { iniciarSuscripcion, cancelarSuscripcion }; 
