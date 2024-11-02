/* eslint-disable quotes */
import suscripcionController from '../controllers/suscripcion.controller.js'; 

import express from 'express'; 

const router = express.Router(); 

router.post('/iniciar-suscripcion', suscripcionController.iniciarSuscripcion);
router.post('/cancelar-suscripcion', suscripcionController.cancelarSuscripcion);

export default router; 
