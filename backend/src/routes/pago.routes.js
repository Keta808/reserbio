/* eslint-disable quotes */
// pago.routes.js
import express from 'express';
const router = express.Router();
import { pagoExitoso, pagoFallido } from '../controllers/pago.controller.js';

router.get('/pago-exitoso', pagoExitoso);
router.get('/pago-fallido', pagoFallido);

export default router; 
