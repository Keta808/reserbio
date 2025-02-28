/* eslint-disable quote-props */
/* eslint-disable space-before-blocks */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
import axios from "axios";
import MercadoPagoAcc from "../models/mercadoPago.model.js"; 
import servicioService from "./servicio.service.js"; 

import { CLIENT_ID, CLIENT_SECRET } from "../config/configEnv.js"; 
import { MP_REDIRECT_URI, MP_WEBHOOK_URL } from "../config/configEnv.js";

import { handleError } from "../utils/errorHandler.js";

async function crearMercadoPagoAcc(idMicroempresa) {
    try {
        const newMercadoPagoAcc = new MercadoPagoAcc({ idMicroempresa });   
        await newMercadoPagoAcc.save(); 
        return [newMercadoPagoAcc, null];
    } catch (error) {
        handleError(error, "mercadoPago.service -> crearMercadoPagoAcc");
        return [null, error];
    }
}
async function getMercadoPagoAcc(idMicroempresa) {
    try {
        if (!idMicroempresa) return [null, "No se especificó la microempresa."];
        const mercadoPagoAcc = await MercadoPagoAcc.findOne({ idMicroempresa });
        if (!mercadoPagoAcc ) {
            return [null, "No hay cuanta vinculada para esa microempresa."];
        } 
        return [mercadoPagoAcc, null];
    } catch (error) {
        handleError(error, "mercadoPago.service -> getMercadoPagoAcc");
        return [null, error];
    }
} 
async function updateMercadoPagoAcc(idMicroempresa, data) {
    try {
        const mercadoPagoAcc = await MercadoPagoAcc.findOneAndUpdate({ idMicroempresa }, 
            data, 
        { new: true });
        if (!mercadoPagoAcc) {
            return [null, "No hay cuenta vinculada para esa microempresa."];
        } 
        return [mercadoPagoAcc, null];
    } catch (error) { 
        handleError(error, "mercadoPago.service -> updateMercadoPagoAcc");
        return [null, error];
    }
}
async function deleteMercadoPagoAcc(idMicroempresa) {
    try {
        const mercadoPagoAcc = await MercadoPagoAcc.findOneAndDelete({ idMicroempresa });
        if (!mercadoPagoAcc) {
            return [null, "No hay cuenta vinculada para esa microempresa."];
        } 
        return [mercadoPagoAcc, null];
    } catch (error) {
        handleError(error, "mercadoPago.service -> deleteMercadoPagoAcc");
        return [null, error];
    }
} 
async function getMercadoPagoAccs(){
    try {
        const mercadoPagoAccs = await MercadoPagoAcc.find();
        if (!mercadoPagoAccs) return [null, "No hay cuentas de MercadoPago vinculadas."];
        return [mercadoPagoAccs, null];
    } catch (error) {
        handleError(error, "mercadoPago.service -> getMercadoPagoAccs");
        return [null, error];
    }
}
async function onBoarding(code, idMicroempresa) {
    try {
        if (!code || !idMicroempresa) {
            return [null, "Código o ID de microempresa no proporcionados."];
        }
        //  Solicitar tokens a Mercado Pago
        const response = await axios.post("https://api.mercadopago.com/oauth/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: MP_REDIRECT_URI, 
            test_token: true,
        }, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
        });
        if (!response.data) {
            return [null, "No se pudo obtener el token de acceso."];
        } 
        console.log("Respuesta MP ONBOARDING: ", response.data);
        const { access_token, refresh_token, public_key, user_id } = response.data; 
        if (!access_token) {
            return [null, "No se recibió el token de acceso."];
        }
        const newMercadoPagoAcc = new MercadoPagoAcc( 
            { idMicroempresa },
            { 
              accessToken: access_token,
              refreshToken: refresh_token,
              mercadopagoUserId: user_id,
              public_key: public_key,
              mercadopagoAccountStatus: "activa",
            },
            { upsert: true, new: true },
    );

        return [newMercadoPagoAcc, null];
    } catch (error) {
        handleError(error, "mercadoPago.service -> onBoarding");
        return [null, "Error al vincular la cuenta de MercadoPago."];
    } 
} 

async function generarUrlOnBoarding(idMicroempresa) { 
  try {
    if (!idMicroempresa) return [null, "No se especificó la microempresa."]; 
        console.log("ID MICROEMPRESA: ", idMicroempresa); 
        console.log("CLIENT_ID: ", CLIENT_ID);
        console.log("REDIRECT_URI: ", MP_REDIRECT_URI);
        const authUrl = `https://auth.mercadopago.com/authorization?client_id=${CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${MP_REDIRECT_URI}&state=${idMicroempresa}`; 
        return [authUrl, null];
  } catch (error) { 
    handleError(error, "mercadoPago.service -> generarUrlOnBoarding");
    return [null, "Error al generar la URL de onboarding."];
  }
}
// Renovar Tokens 

async function refreshToken(idMicroempresa){
    try {
        if (!idMicroempresa) return [null, "No se especificó la microempresa."];
        const mercadoPagoAcc = await MercadoPagoAcc.findOne({ idMicroempresa });
        if (!mercadoPagoAcc) return [null, "No hay cuenta vinculada para esa microempresa."];
        if (!mercadoPagoAcc.refreshToken) return [null, "No hay token de refresco."];
        // Solicitar un nuevo accessToken a Mercado Pago
        const response = await axios.post("https://api.mercadopago.com/oauth/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: mercadoPagoAcc.refreshToken,
        }, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (!response.data) return [null, "No se pudo obtener el token de acceso."];
        console.log("Respuesta MP REFRESH TOKEN: ", response.data);
        const { access_token, refresh_token, public_key, user_id } = response.data;
        
        if (!access_token) return [null, "No se recibió el token de acceso."];
        mercadoPagoAcc.accessToken = access_token;
        mercadoPagoAcc.refreshToken = refresh_token;
        mercadoPagoAcc.public_key = public_key;
        mercadoPagoAcc.mercadopagoUserId = user_id;
        await mercadoPagoAcc.save();
        console.log("TOKENS REFRESCADOS: ", mercadoPagoAcc);
        return [mercadoPagoAcc, null];
    } catch (error) {
        handleError(error, "mercadoPago.service -> refreshToken");
        return [null, "Error al renovar el token de acceso."];
    }
}

async function crearPreferenciaServicio(idServicio){
    try {
        const servicio = await servicioService.getServicioById(idServicio);

        if (!servicio) return [null, "El servicio no existe."];
        if (!servicio.precio) return [null, "El servicio no tiene precio."];
        if (!servicio.porcentajeAbono) return [null, "Debes configurar el porcentaje de abono antes de realizar esta acción."];
        
        const [montoAbono, error] = servicioService.calcularMontoAbono(idServicio, servicio.precio, servicio.porcentajeAbono); 
        if (error) return [null, error];
        const microempresaMP = await MercadoPagoAcc.findOne({ idMicroempresa: servicio.idMicroempresa }); 
        if (!microempresaMP || !microempresaMP.accessToken) return [null, "No hay cuenta de MercadoPago vinculada."]; 
        const accessToken = microempresaMP.accessToken; 
        const notificationURL = MP_WEBHOOK_URL;
        console.log("Microempresa: ", microempresaMP); 
        console.log("ACCESS TOKEN: ", accessToken);
        console.log("MONTO ABONO: ", montoAbono);
        console.log("NOTIFICATION URL: ", notificationURL);
        // Crear preferencia de pago 
        const response = await axios.post(
            "https://api.mercadopago.com/checkout/preferences",
            {
                items: [
                    {
                        title: servicio.nombre,
                        description: servicio.descripcion,
                        quantity: 1,
                        currency_id: "CLP",
                        unit_price: montoAbono,
                    },
                ],
                payment_methods: {
                    excluded_payment_types: [
                        {},
                    
                    ],
                    installments: 1,    
                },
                back_urls: {
                    success: "https://www.mercadopago.com",
                },
                auto_return: "approved",
                external_reference: servicio.idMicroempresa,
                notification_url: notificationURL,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );
        console.log("RESPUESTA MP PREFERENCIA: ", response.data);
        console.log("PREFERENCIA DE PAGO CREADA: ", response.data.init_point);
        if (!response.data || !response.data.init_point) return [null, "No se pudo crear la preferencia de pago."];
        const servicioActualizado = await servicioService.updateServicio(idServicio, { urlPago: response.data.init_point }); 
        console.log("Servicio actualizado con URL de pago: ", servicioActualizado); 

        return [response.data.init_point, null];
    } catch (error){
        handleError(error, "mercadoPago.service -> crearPreferenciaServicio");
        return [null, error];
    }
}

export default { 
    crearMercadoPagoAcc, 
    getMercadoPagoAcc,
    updateMercadoPagoAcc,
    deleteMercadoPagoAcc, 
    onBoarding,
    generarUrlOnBoarding,
    getMercadoPagoAccs,
    refreshToken,
    crearPreferenciaServicio,
}; 
