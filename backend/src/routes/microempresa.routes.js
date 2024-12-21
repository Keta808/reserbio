"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Controlador de microempresas */
import microempresaController from "../controllers/microempresa.controller.js";

/** Middleware de autorización */
import { isAdmin, isTrabajador, isCliente } from "../middlewares/authorization.middleware.js";

/** Middleware de autentificacion */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define el middleware de autenticación para todas las rutas
router.use(authenticationMiddleware);
// Define las rutas para las microempresas
router.get("/", isAdmin, microempresaController.getMicroempresas);
router.get("/:id", isAdmin, microempresaController.getMicroempresaById);
// router.get("/nombre/:nombre", isAdmin, microempresaController.getMicroempresaByNombre);
router.post("/", isAdmin, microempresaController.createMicroempresa);
router.put("/:id", isAdmin, microempresaController.updateMicroempresaById);
router.delete("/:id", isAdmin, microempresaController.deleteMicroempresaById);
router.get("/categoria/:categoria", isAdmin, microempresaController.getMicroempresasPorCategoria);

// Exporta el enrutador
export default router;
