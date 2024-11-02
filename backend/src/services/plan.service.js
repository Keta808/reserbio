/* eslint-disable comma-dangle */
/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable space-before-blocks */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */

import Plan from "../models/plan.model.js";

import { handleError } from "../utils/errorHandler.js";


async function getPlanes() {
    try {
        const planes = await Plan.find().exec();
        if (!planes) return [null, "No hay planes"];
        return [planes, null];
    } catch (error) {
        handleError(error, "plan.service -> getPlanes");
    }
}

async function createPlan(plan) {
    try { 
        const { tipo_plan, precio, estado } = plan;

        // Crear un nuevo plan
        const newPlan = new Plan({
            tipo_plan,
            precio,
            preapproval_plan_id, 
            estado,
        });
        
        // Guardar el plan en la base de datos
        await newPlan.save();

        return [newPlan, null];
    } catch (error) { 
        handleError(error, "plan.service -> createPlan");
    }
}

async function deletePlan(id) {
    try {
        const plan = await Plan.findByIdAndDelete(id).exec();
        if (!plan) return [null, "El plan no existe"];
        return [plan, null];
    } catch (error) {
        handleError(error, "plan.service -> deletePlan");
    }
} 

async function updatePlan(id, plan) {
    try {
        const { tipo_plan, precio, estado } = plan;
        const updatedPlan = await Plan.findByIdAndUpdate(id, {
            tipo_plan,
            precio,
            estado,
        }, { new: true }).exec();
        if (!updatedPlan) return [null, "El plan no existe"];
        return [updatedPlan, null];
    } catch (error) {
        handleError(error, "plan.service -> updatePlan");
    }
} 

import axios from 'axios';
import { ACCESS_TOKEN } from '../config/configEnv.js';

async function crearPlanSuscripcion(data) {
    try {
        const response = await axios.post('https://api.mercadopago.com/preapproval_plan', data, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.id; // Retorna el ID del plan creado en MercadoPago
    } catch (error) {
        handleError(error, "plan.service -> crearPlanSuscripcion");
        throw new Error("Error al crear el plan en MercadoPago");
    }
}


// Endpoint para crear planes de suscripción
async function crearPlanes() {
    try {
        const planesData = [
            {
                reason: "Suscripción Básica",
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    repetitions: 12,
                    transaction_amount: 3000,
                    currency_id: "CLP",
                    billing_day: 10,
                    free_trial: {
                        frequency: 1,
                        frequency_type: "months"
                    },
                    back_url: 'http://localhost:3000/api/pagos/pago-exitoso'
                },
                
            },
            {
                reason: "Suscripción Premium",
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    repetitions: 12,
                    transaction_amount: 5000,
                    currency_id: "CLP",
                    billing_day: 10,
                    free_trial: {
                        frequency: 1,
                        frequency_type: "months"
                    },
                    back_url: 'http://localhost:3000/api/pagos/pago-exitoso'
                },
            }
        ];

        for (const planData of planesData) {
            const preapprovalPlanId = await crearPlanSuscripcion(planData);

            await Plan.create({
                tipo_plan: planData.reason.split(' ')[1], // "Básica" o "Premium"
                precio: planData.auto_recurring.transaction_amount,
                preapproval_plan_id: preapprovalPlanId,
                estado: 'activo'
            });
        }

        return { message: "Planes creados exitosamente." };
    } catch (error) {
        handleError(error, "plan.service -> crearPlanes");
        throw new Error("Error al crear planes en la base de datos.");
    }
}


export default { getPlanes, createPlan, deletePlan, updatePlan, crearPlanes }; 

