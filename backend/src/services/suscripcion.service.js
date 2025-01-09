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

        const { idUser, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id } = suscripcion;

        const updatedSuscripcion = await Suscripcion.findByIdAndUpdate(
            id,
            { idUser, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id },
            { new: true }
        ).exec();

        return [updatedSuscripcion, null];
    } catch (error) {
        handleError(error, "suscripcion.service -> updateSuscripcion");
    }
}


async function crearSuscripcion(tipoPlan, user, cardTokenId){
    try {
        const plan = tipoPlan;
        if (!plan) {
            throw new Error("No se encontró el plan.");
        }
        
        // Configurar fechas de la suscripción
        const startDate = new Date(); // Fecha actual
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1); // Duración: 1 mes 
        const preapprovalData = {
            preapproval_plan_id: plan.mercadoPagoId,
            reason: `Suscripción ${plan.tipo_plan}`,
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
            idUser: user._id,
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

async function cancelarSuscripcion(user, preapprovalId) {
    try {
        if (!preapprovalId) throw new Error("ID de preaprobación no proporcionado.");

        const suscripcion = await Suscripcion.findOne({ preapproval_id: preapprovalId, estado: "activo" }).exec();
        if (!suscripcion) {
            return [null, "No se encontró una suscripción activa con este ID."];
        }

        if (String(suscripcion.idUser) !== String(user._id)) {
            throw new Error("No tienes permiso para cancelar esta suscripción.");
        }

        await axios.put(
            `https://api.mercadopago.com/preapproval/${preapprovalId}`,
            { status: "cancelled" },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );

        suscripcion.estado = "cancelado";
        await suscripcion.save();

        return [{ message: "Suscripción cancelada exitosamente." }, null];
    } catch (error) {
        console.error(`Error al cancelar la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> cancelarSuscripcion");
    }
} 
async function sincronizarEstados() {
    try {
        const suscripcionesActivas = await Suscripcion.find({ estado: "activo" }).exec();
        if (suscripcionesActivas.length === 0) {
            console.log("No hay suscripciones activas para sincronizar.");
            return;
        }

        for (const suscripcion of suscripcionesActivas) {
            const response = await axios.get(
                `https://api.mercadopago.com/preapproval/${suscripcion.preapproval_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    }
                }
            );

            const estadoMP = response.data.status;
            const fechaFinMP = new Date(response.data.auto_recurring.end_date);

            if (estadoMP === "cancelled") {
                suscripcion.estado = "cancelado";
            } else if (estadoMP === "paused") {
                suscripcion.estado = "pausado";
            } else if (new Date() > fechaFinMP) {
                suscripcion.estado = "expirado";
            }

            // Sincronizar fecha_fin si es diferente
            if (suscripcion.fecha_fin.getTime() !== fechaFinMP.getTime()) {
                suscripcion.fecha_fin = fechaFinMP;
            }

            await suscripcion.save();
        }

        console.log("Sincronización de estados completada.");
    } catch (error) {
        console.error("Error al sincronizar estados:", error.response?.data || error.message);
        handleError(error, "suscripcion.service -> sincronizarEstados");
    }
}
 
export default { crearSuscripcion, cancelarSuscripcion, getSuscripciones, getSuscripcion, deleteSuscripcion, updateSuscripcion, sincronizarEstados }; 
