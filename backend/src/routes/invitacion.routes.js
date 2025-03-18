"use strict";
// Importa el módulo 'express' para crear las rutas
import { Router } from "express";

/** Controlador de invitaciones */
import InvitacionController from "../controllers/invitacion.controller.js";

/** Middleware de autenticación */
import verifyJWT from "../middlewares/authentication.middleware.js";

/** Middleware de suscripción */
// import suscripcionMiddleware from "../middlewares/verificarSuscripcion.middleware.js"; 
// verifica si el usuario es dueño de la microempresa
import verificarAdminMicroempresa from "../middlewares/verificarAdminM.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Aplica el middleware de autenticación a todas las rutas
router.use(verifyJWT);

// 📌 Ruta para enviar una invitación (solo dueños con plan premium)
router.post("/enviar", InvitacionController.enviarInvitacion);

// 📌 Nueva ruta para verificar un código de invitación
router.get("/verificar-codigo/:codigo", InvitacionController.verificarCodigoInvitacion);

// 📌 Nueva ruta para aceptar una invitación con código numérico
router.post("/aceptar/:codigo", InvitacionController.aceptarInvitacion);

// 📌 Ruta para obtener invitaciones pendientes de una microempresa
router.get(
    "/pendientes/:idMicroempresa",
    InvitacionController.obtenerInvitaciones,
);

// 📌 Ruta para eliminar las invitaciones
router.delete(
    "/eliminar/:id",
    InvitacionController.eliminarInvitacion,
);

// Exporta el enrutador
export default router;

