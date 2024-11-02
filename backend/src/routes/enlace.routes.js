"use strict";

import { Router } from "express";

import enlaceController from "../controllers/enlace.controller.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";

import authentificationMiddleware from "../middlewares/authentication.middleware.js";

const router = Router();    

router.use(authentificationMiddleware); 

router.get("/", isAdmin, enlaceController.getEnlaces);
router.post("/", isAdmin, enlaceController.createEnlace);
router.delete("/:id", isAdmin, enlaceController.deleteEnlace);
router.put("/:id", isAdmin, enlaceController.updateEnlace);
router.get("/microempresa/:id", isAdmin, enlaceController.getTrabajadoresPorMicroempresa);
router.put("/update/:id", isAdmin, enlaceController.updateEnlaceParcial);

export default router;
