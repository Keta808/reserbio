import instance from './root.services.js'; 

async function verificarUltimoPago(idServicio){
    try{
        const response = await instance.post('/payments/verificar-pago', {idServicio});
        return [response.data, null];
    } catch (error) {
        return [null, error.response.data];
    }
}
async function refundPayment(paymentId){
    try{
        const response = await instance.post(`/payments/refund/${paymentId}`);
        return [response.data, null];
    } catch (error) {
        return [null, error.response.data];
    }
}
async function actualizarPago(data){
    try {
        const response = await instance.post('/payments/actualizar-id-cliente', data );
        return [response.data, null];
    } catch (error) {
        return [null, error.response.data];
    }
}
async function getPaymentByClientId(idCliente){
    try {
        const response = await instance.get(`/payments/payment-cliente/${idCliente}`);
        return [response.data, null];
    } catch (error) {
        return [null, error.response.data];
    }
}
export default {
    verificarUltimoPago,
    refundPayment,
    actualizarPago,
    getPaymentByClientId,
};
