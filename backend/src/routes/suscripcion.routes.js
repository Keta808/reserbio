/* eslint-disable quotes */
import suscripcionController from '../controllers/suscripcion.controller.js'; 
// AGREGAR MIDDLEWARES

import express from 'express'; 

const router = express.Router(); 

router.post('/obtener-suscripcion', suscripcionController.crearSuscripcion);
router.get('/suscripciones', suscripcionController.getSuscripciones);
router.get('/suscripcion/:id', suscripcionController.getSuscripcion);
router.delete('/suscripcion/:id', suscripcionController.deleteSuscripcion);
router.put('/suscripcion/:id', suscripcionController.updateSuscripcion);

// rutas para pagos 
router.get('/emisoras', suscripcionController.getIssuers);
router.get('/Id-Types', suscripcionController.getIdentificationTypes); 
router.post('/cardForm', suscripcionController.cardForm);


export default router; 
