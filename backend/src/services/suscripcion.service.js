/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable require-jsdoc */
import axios from 'axios';
import Suscripcion from '../models/suscripcion.model.js';
// import Plan from '../models/plan.model.js'; 
// import User from "../models/user.model.js"; 
import { handleError } from "../utils/errorHandler.js";
import { ACCESS_TOKEN } from '../config/configEnv.js';

async function crearSuscripcionBasica(user, cardTokenId) { 
    const startDate = new Date(); // Fecha actual
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1); // Un mes después de la fecha de inicio
    const suscripcionBasica = {
        preapproval_plan_id: "2c93808492f5938b0192fea4195b0466",
        reason: "Suscripción básica", 
        external_reference: `USER-${user._id}`,
        payer_email: user.email,
        card_token_id: cardTokenId,
        auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            transaction_amount: 3000,
            currency_id: "CLP",
            
        },
        back_url: "https://www.mercadopago.com",
        status: "authorized"
    }; 
    try {
        const response = await axios.post(
            "https://api.mercadopago.com/preapproval",
            suscripcionBasica,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );
        console.log("Respuesta mercado pago:", response.data);
        const preapprovalId = response.data.id; 
        const planBasico = await Plan.findOne({ tipo_plan: "Plan Basico" });
        const suscripcion = new Suscripcion({
            idUsuario: user._id,
            idPlan: planBasico._id,
            estado: "active",
            fecha_inicio: new Date(),
            fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            preapproval_id: preapprovalId,
        });
        await suscripcion.save();
        return { message: "Suscripcion basica creada exitosamente.", suscripcion }; 
    } catch (error) {
        console.error(`Error al crear el suscripcion ${suscripcionBasica.reason}:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> crearSuscripcionBasica");
}
}
 
export default { crearSuscripcionBasica }; 
