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
        const suscripciones = await Suscripcion.find().populate("idPlan idUser").exec();
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

        const suscripcion = await Suscripcion.findById(id).populate("idPlan idUser").exec();
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
// Funciones para obtener datos dinámicos de Mercado Pago
// funcion para obtener issuers (bancos emisores)
async function getIssuers(paymentMethodId){
    try { 
        
    const response = await axios.get(
        `https://api.mercadopago.com/v1/payment_methods/card_issuers?payment_method_id=${paymentMethodId}`,
        {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        }
    );

    return response.data; // Devuelve la lista de emisores
} catch (error) {
    console.error(`Error al obtener emisores:`, error.response?.data || error.message);
    handleError(error, "suscripcion.service -> getIssuers");
}
}  
// Funcion para obtener tipos de identificacion
async function getIdentificationTypes(){
    try {
        const response = await axios.get(
            "https://api.mercadopago.com/v1/identification_types",
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );

        return response.data; // Devuelve los tipos de identificación
    } catch (error) {
        console.error(`Error al obtener tipos de identificación:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> getIdentificationTypes");
    }
}
async function getSuscripcionBypreapprovalId(preapprovalId) {
    try {
        if (!preapprovalId) throw new Error("ID de suscripción no proporcionado.");

        const suscripcion = await Suscripcion.findOne({ preapproval_id: preapprovalId }).exec();
        if (!suscripcion) return [null, "La suscripción no existe."];

        return [suscripcion, null];
    } catch (error) {
        handleError(error, "suscripcion.service -> getSuscripcionBypreapprovalId");
        return [null, error.message];
    }
}
// Funciones Tarjeta-Suscripcion Mercado Pago 
async function updateSuscripcionCard(preapprovalId, newCardTokenId){ 
    try {
        if (!preapprovalId) throw new Error("ID de suscripción no proporcionado.");
        // SOLICITUD MERCADO PAGO
        const response = await axios.put(`https://api.mercadopago.com/preapproval/${preapprovalId}`,
            {
                card_token_id: newCardTokenId
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }

        );
        return [response.data, null];   
    } catch (error){
        console.error(`Error al actualizar la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> updateSuscripcionCard");
        return [null, error.response?.data || error.message];
    }
}
// Funcion para generar cardTokenId
async function cardForm(paymentData){
    try { 
        // DEPURACION: Mostrar datos recibidos
        console.log("CARD FORM: Datos recibidos para generar cardTokenId:", paymentData);
        const { cardNumber, expirationMonth, expirationYear, securityCode, cardholderName, issuer, identificationType, identificationNumber, cardholderEmail } = paymentData; 
        const payload = {
            card_number: cardNumber, 
            expiration_month: parseInt(expirationMonth, 10),
            expiration_year: parseInt(expirationYear, 10),
            security_code: securityCode,
            cardholder: {
                name: cardholderName,
                email: cardholderEmail,
                identification: {
                    type: identificationType,
                    number: identificationNumber,
                },    
            }, 
            issuer_id: issuer,
        }; 
        console.log("Datos enviados a Mercado Pago:", payload);
        const response = await axios.post(
            "https://api.mercadopago.com/v1/card_tokens",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("CARD FORM: Respuesta de Mercado Pago:", response.data);
        if (response.data.id) {
            return response.data.id; // Devuelve el cardTokenId
        } else {
            console.error("No se generó un cardToken válido:", response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error al generar cardTokenId:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> cardForm");
    }
}

// Funcion obtener Suscripcion 
async function obtenerSuscripcion(plan, user, cardTokenId, payer_email){
    try {
        if (!plan || !user || !cardTokenId || !payer_email){
            return [null, "Faltan datos para crear la suscripción."];
        }
        // Configurar fechas de la suscripción
        const startDate = new Date(); // Fecha actual
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1); // Duración: 1 mes   
        // DEPURACION: Mostrar fechas
        console.log("SERVICES OBTENER SUS: Fecha de inicio:", startDate.toISOString());
        console.log("SERVICES OBTENER SUS: Fecha de término:", endDate.toISOString());
        console.log("SERVICES OBTENER SUS: Payer Email:", payer_email);

        // DEPURACION: Mostrar datos de la suscripción
        console.log("SERVICES OBTENER SUS: Datos de suscripción:", { plan, user, cardTokenId, payer_email });


        const preapprovalData = {
            preapproval_plan_id: plan.mercadoPagoId,
            reason: "Suscripción Plan Reserbio",
            payer_email: payer_email,
            card_token_id: cardTokenId.cardTokenId,
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

        console.log("SERVICES OBTENER SUS: Datos de preaprobación:", preapprovalData); 
        const cleanData = JSON.parse(JSON.stringify(preapprovalData));

        console.log("Datos limpios enviados a Mercado Pago:", cleanData);
        // SOLICITUD MERCADO PAGO 
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
        if (!response.data || !response.data.id) {
            return [null, "Error en la respuesta de Mercado Pago."];
        } 
        console.log("SERVICE OBTENER SUS: Respuesta de Mercado Pago:", response.data);
        console.log("SERVICE OBTENER SUS:ID de preaprobación:", response.data.id);
        // Obtener preaproval_id de la respuesta
        const preapprovalId = response.data.id;
        

        // Guardar la suscripción en la BD
        const [suscripcion, error] = await crearSuscripcion({
            idUser: user.id,
            idPlan: plan._id,
            estado: "activo",
            fecha_inicio: startDate,
            fecha_fin: endDate,
            preapproval_id: preapprovalId,
        });

        if (error) {
            return [null, "Error al guardar la suscripción en la BD."];
        }

        return [suscripcion, null];



    } catch (error){
        console.error(`Error al crear la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> crearSuscripcion");
        return [null, error.response?.data || error.message];
    }
} 
// Funcion para Buscar en las Suscripciones 
async function searchSuscripcionMP(params){ 
    try {
         // SOLICITUD MERCADO PAGO 
         const response = await axios.get(
            "https://api.mercadopago.com/preapproval/search",
            
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            },
            params,

        );
        // Retorna los resultados encontrados
        return [response.data.results, null];
    } catch (error) {
        console.error(`Error al buscar la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> searchSuscripcionMP");
        return [null, error.response?.data || error.message];
    }
}   
// Funcion getSuscripcionById
async function getSuscripcionById(id){
    try {
        if (!id) throw new Error("ID de suscripción no proporcionado.");
         // SOLICITUD MERCADO PAGO 
         const response = await axios.get(
            "https://api.mercadopago.com/preapproval/{id}",
            id,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        ); 
        return [response.data, null];
    } catch (error) {
        console.error(`Error al obtener la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> getSuscripcionById");
        return [null, error.response?.data || error.message];
    }
} 
// Funcion para Actualizar Suscripcion 
async function updateSuscripcionMP(id, data){
    try {
        if (!id) throw new Error("ID de suscripción no proporcionado.");
        // SOLICITUD MERCADO PAGO 
        const response = await axios.put(
            "https://api.mercadopago.com/preapproval/{id}",
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );
        return [response.data, null];
    } catch (error) {
        console.error(`Error al actualizar la suscripción:`, error.response?.data || error.message);
        handleError(error, "suscripcion.service -> updateSuscripcion");
        return [null, error.response?.data || error.message];
    }
}

async function crearSuscripcion(suscripcionData){
    try {
        const { idUser, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id } = suscripcionData;
        const nuevaSuscripcion = new Suscripcion({ idUser, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id });
        console.log("Datos de suscripción a guardar:", { idUser, idPlan, estado, fecha_inicio, fecha_fin, preapproval_id });
        await nuevaSuscripcion.save();
        return [nuevaSuscripcion, null];
    } catch (error) {
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
 
export default { crearSuscripcion, cancelarSuscripcion, getSuscripciones, getSuscripcion, 
deleteSuscripcion, updateSuscripcion, sincronizarEstados, 
getIssuers, getIdentificationTypes, cardForm, obtenerSuscripcion, 
searchSuscripcionMP, getSuscripcionById, updateSuscripcionMP, getSuscripcionBypreapprovalId, updateSuscripcionCard,
}; 
