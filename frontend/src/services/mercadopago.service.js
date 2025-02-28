import instance from './root.services';
async function generarUrlOnBoarding(idMicroempresa) {
    try {
        const response = await instance.post(`/mercadopago/generar-url`, {
            idMicroempresa, 
        });
        return [response.data, null];
    } catch (error) {
        console.error(
            "Error al generar la URL de onboarding:",
            error.response?.data || error.message
        );
        return [null, error.response?.data || error.message]; 
    }
} 
async function onBoarding(){
    try{
        const response = await instance.get('/mercadopago/callback');
        return [response.data, null];
    } catch (error) {
        console.error(
            "Error al procesar el onboarding:",
            error.response?.data || error.message
        );
        return [null, error.response?.data || error.message]; 
    }
} 
async function obtenerRedirect() {
    try { 
        const response = await instance.get('/mercadopago/redirect');
        return [response.data, null];  

    } catch (error) {
        console.error("Error al obtener la URL de redirección:", error.response?.data || error.message);
        return [null, error.response?.data || error.message];
    }
}
async function crearPreferenciaServicio(idServicio) {
    try {  
        const response = await instance.post(`/mercadopago/servicio/${idServicio}`);
        return [response.data, null];

    } catch(error){
        console.error("Error al crear la preferencia de pago:", error.response?.data || error.message);
        return [null, error.response?.data || error.message];
    }
}
async function getMercadoPagoAcc(idMicroempresa){
    try{ 
        const response = await instance.get(`/mercadopago/getMercadoPagoAcc/${idMicroempresa}`);
        return [response.data, null];
    } catch (error) {
        return [null, error.response?.data || error.message];
    }
}
export default {
    generarUrlOnBoarding,
    onBoarding,
    obtenerRedirect,
    crearPreferenciaServicio,
    getMercadoPagoAcc,
}; 
