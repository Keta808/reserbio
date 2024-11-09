/* eslint-disable padded-blocks */
/* eslint-disable no-console */
/* eslint-disable max-len */
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
        const { tipo_plan, mercadoPagoId, estado, fecha_creacion } = plan;

        // Crear un nuevo plan
        const newPlan = new Plan({
            tipo_plan,
            mercadoPagoId,
            estado,
            fecha_creacion,
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


// Endpoint para crear planes de suscripción
async function crearPlanBasico() {
    const plan = {
        reason: 'Plan Basico',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          repetitions: 12,
          billing_day: 10,
          billing_day_proportional: true,
          free_trial: {
            frequency: 1,
            frequency_type: 'months',
          },
          transaction_amount: 3000,
          currency_id: 'CLP',
          payment_methods_allowed: {
            payment_types: [
              { id: 'credit_card' },
              { id: 'debit_card' },
            ],
          },
        },
        back_url: 'https://www.mercadopago.com',
    };
      
    
    try {
            const response = await axios.post(
              'https://api.mercadopago.com/preapproval_plan',
              plan,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
              }
            );

        console.log(response.data); 
        console.log(`Plan creado: ${plan.reason}`, response.data);  
        
        const existingPlan = await Plan.findOne({ mercadoPagoId: response.data.id }).exec();
        if (existingPlan) {
            return { message: "El plan ya existe.", plan: existingPlan };
        }
        // Guardar el plan en la base de datos
        const newPlan = new Plan({
            tipo_plan: 'Plan Basico',
            mercadoPagoId: response.data.id,
            estado: response.data.status,
            fecha_creacion: response.data.date_created,
        });

        await newPlan.save(); // Guardar en MongoDB

        return { message: "Plan basico creado exitosamente.", plan: newPlan };
    } catch (error) { 
        console.error(`Error al crear el plan ${plan.reason}:`, error.response?.data || error.message);
        handleError(error, "plan.service -> crearPlanBasico");
        throw new Error("Error al crear plan en la base de datos.");
    }
} 

async function crearPlanPremium(){ 
    const planP = {
        reason: 'Plan Premium',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          repetitions: 12,
          billing_day: 10,
          billing_day_proportional: true,
          free_trial: {
            frequency: 1,
            frequency_type: 'months',
          },
          transaction_amount: 5000,
          currency_id: 'CLP',
          payment_methods_allowed: {
            payment_types: [
              { id: 'credit_card' },
              { id: 'debit_card' },
            ],
          },
        },
        back_url: 'https://www.mercadopago.com',
      }; 
    
    try {
        const response = await axios.post(
          'https://api.mercadopago.com/preapproval_plan',
          planP,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
          }
        );

    console.log(response.data); 
    console.log(`Plan creado: ${planP.reason}`, response.data); 
    

    // Guardar el plan en la base de datos
    const newPlan = new Plan({
        tipo_plan: 'Plan Premium',
        mercadoPagoId: response.data.id,
        estado: response.data.status,
        fecha_creacion: response.data.date_created,
    });

    await newPlan.save(); // Guardar en MongoDB

    return { message: "Plan premium creado exitosamente.", plan: newPlan };
} catch (error) { 
    console.error(`Error al crear el plan ${planP.reason}:`, error.response?.data || error.message);
    handleError(error, "plan.service -> crearPlanPremium");
    throw new Error("Error al crear plan en la base de datos.");  
}  

} 

async function crearPlanGratuito() {
  try {
      // Crear y guardar el plan gratuito en MongoDB
      const newPlan = new Plan({
          tipo_plan: 'Plan Gratuito',
          mercadoPagoId: 'GRATIS', // ID específico para el plan gratuito
          estado: 'active', // Estado puede ser "active" o cualquier valor que prefieras
          fecha_creacion: new Date(),
      });

      await newPlan.save(); // Guardar en MongoDB

      console.log("Plan gratuito creado exitosamente:", newPlan);
      return { message: "Plan gratuito creado exitosamente.", plan: newPlan };
  } catch (error) {
      console.error("Error al crear el plan gratuito:", error.message);
      handleError(error, "plan.service -> crearPlanGratuito");
      throw new Error("Error al crear plan gratuito en la base de datos.");
  }
}

export default { getPlanes, createPlan, deletePlan, updatePlan, crearPlanBasico, crearPlanPremium, crearPlanGratuito }; 

