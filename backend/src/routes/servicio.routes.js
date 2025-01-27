"use strict";

import { Router } from "express";

import servicioController from "../controllers/servicio.controller.js"; 
import { isAdmin, isCliente, isTrabajador } from "../middlewares/authorization.middleware.js";


import authentificationMiddleware from "../middlewares/authentication.middleware.js"; 

const router = Router(); 

router.use(authentificationMiddleware); 

router.get("/", isAdmin, servicioController.getServicios); 
router.post("/", isAdmin, servicioController.createServicio);
router.delete("/:id", isAdmin, servicioController.deleteServicio);
router.put("/:id", isAdmin, servicioController.updateServicio);
router.get("/servicio/:id", isAdmin, servicioController.getServicioById); 
router.get("/servicios/:id", servicioController.getServiciosByMicroempresaId);


export default router; 

