/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable eol-last */
import cron from 'node-cron';
import suscripcionService from '../services/suscripcion.service.js';

// Configurar un job mensual para sincronizar estados
cron.schedule('0 0 1 * *', async () => {
    try {
        console.log("Iniciando job de sincronización de estados de suscripciones...");
        await suscripcionService.sincronizarEstados();
        console.log("Job de sincronización completado exitosamente.");
    } catch (error) {
        console.error("Error durante el job de sincronización:", error);
    }
});