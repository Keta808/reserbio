/* eslint-disable quotes */
import suscripcionController from '../controllers/suscripcion.controller.js'; 

import express from 'express'; 

const router = express.Router(); 

router.post('/suscripcion-basica', suscripcionController.crearSuscripcionBasica);


export default router; 
