/* eslint-disable no-multiple-empty-lines */
/* eslint-disable padded-blocks */
/* eslint-disable camelcase */
/* eslint-disable space-before-blocks */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable require-jsdoc */
import axios from 'axios';
import Suscripcion from '../models/suscripcion.model.js';
import Plan from '../models/plan.model.js';  
import Microempresa from '../models/microempresa.model.js';
import { handleError } from "../utils/errorHandler.js";
import { ACCESS_TOKEN } from '../config/configEnv.js'; 

async function getSuscripciones() {
    try {
        const suscripciones = await Suscripcion.find().populate("idPlan idMicroempresa").exec();
        if (!suscripciones || suscripciones.length === 0) {
            return [null, "No hay suscripciones disponibles."];
        }
        return [suscripciones, null];
    } catch (error) {
        handleError(error, "suscripcion.service -> getSuscripciones");
    }
}
async function getSuscripcion(id) {
    try {
        if (!id) throw new Error("ID de suscripción no proporcionado.");

        const suscripcion = await Suscripcion.findById(id).populate("idPlan idMicroempresa").exec();
        if (!suscripcion) return [null, "La suscripción no existe."];

        return [suscripcion, null];
    } catch (error) {
        handleError(error, "suscripcion.service -> getSuscripcion");
    }
}
// Eliminar una suscripción por ID
async function deleteSuscripcion(id) {
    try {
        if (!id) throw new Error("ID de suscripción no proporcionado.");

        const suscripcion = await Suscripcion.findByIdAndDelete(id).exec();
        if (!suscripcion) return [null, "La suscripción no existe o ya fue eliminada."];

        return [suscripcion, null];
    } catch (error) {
        handleError(error, "suscripcion.service -> deleteSuscripcion");
    }
}
async function updateSuscripcion(id, suscripcion) {
    try {
        if (!id) throw new Error("ID de suscripción no proporcionado.");

        const existingSuscripcion = await Suscripcion.findById(id).exec();
        if (!existingSuscripcion) return [null, "La suscripción no existe."];

        const { idMicroempresa, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id } = suscripcion;

        const updatedSuscripcion = await Suscripcion.findByIdAndUpdate(
            id,
            { idMicroempresa, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id },
            { new: true }
        ).exec();

        return [updatedSuscripcion, null];
    } catch (error) {
        handleError(error, "suscripcion.service -> updateSuscripcion");
    }
}


async function crearSuscripcion(tipoPlan, user, idMicroempresa, cardTokenId){
    try {
        const microempresa = await Microempresa.findById(idMicroempresa); 
        if (!microempresa || String(microempresa.idTrabajador) !== String(user._id)) {
            throw new Error("La microempresa no pertenece al usuario autenticado.");
        } 
        // Buscar plan según el tipo
        const plan = await Plan.findOne({ tipo_plan: tipoPlan });
        if (!plan) {
            throw new Error(`No se encontró el plan: ${tipoPlan}`);
        } 
        // Configurar fechas de la suscripción
        const startDate = new Date(); // Fecha actual
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1); // Duración: 1 mes 
        const preapprovalData = {
            preapproval_plan_id: plan.preapproval_plan_id,
            reason: `Suscripción ${tipoPlan}`,
            external_reference: `MICROEMPRESA-${microempresa._id}`,
            payer_email: user.email,
            card_token_id: cardTokenId,
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                transaction_amount: plan.precio,
                currency_id: "CLP",
            },
            back_url: "https://www.mercadopago.com",
            status: "authorized",
        }; 
        const response = await axios.post(
            "https://api.mercadopago.com/preapproval",
            preapprovalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        ); 
        // Obtener preaproval_id de la respuesta
        const preapprovalId = response.data.id; 

        const nuevaSuscripcion = new Suscripcion({  
            idMicroempresa: microempresa._id,
            idPlan: plan._id,
            estado: "activo",
            fecha_inicio: startDate,
            fecha_fin: endDate,
            preapproval_id: preapprovalId,
        }); 
        await nuevaSuscripcion.save(); 
        return { message: `Suscripción ${tipoPlan} creada exitosamente.`, 
        preapprovalId, 
        };


    } catch (error){
        console.error(`Error al crear la suscripcion:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> crearSuscripcion");
    }
}

async function cancelarSuscripcion(idMicroempresa, user) {
    try {
        if (!idMicroempresa) throw new Error("ID de microempresa no proporcionado.");

        const suscripcion = await Suscripcion.findOne({ idMicroempresa, estado: "activo" }).exec();
        if (!suscripcion) {
            return [null, "No se encontró una suscripción activa para esta microempresa."];
        }

        // Verificar que el usuario sea el propietario de la microempresa
        const microempresa = await Microempresa.findById(idMicroempresa).exec();
        if (!microempresa || String(microempresa.idTrabajador) !== String(user._id)) {
            throw new Error("No tienes permiso para cancelar esta suscripción.");
        }

        // Cancelar la suscripción en Mercado Pago
        await axios.put(
            `https://api.mercadopago.com/preapproval/${suscripcion.preapproval_id}`,
            { status: "cancelled" },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );

        // Actualizar el estado de la suscripción en la base de datos
        suscripcion.estado = "cancelado";
        await suscripcion.save();

        console.log(`Suscripción con ID ${suscripcion.preapproval_id} cancelada en Mercado Pago.`);
        return [{ message: "Suscripción cancelada exitosamente." }, null];
    } catch (error) {
        console.error(`Error al cancelar la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> cancelarSuscripcion");
    }
}
 
export default { crearSuscripcion, cancelarSuscripcion, getSuscripciones, getSuscripcion, deleteSuscripcion, updateSuscripcion }; 
