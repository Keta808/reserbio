"use strict";

import express from "express";
import planController from "../controllers/plan.controller.js";
// import { verifyJWT } from "../middlewares/authentication.middleware.js";
// import { isTrabajador } from "../middlewares/authorization.middleware.js";
// import {verificarPlan} from "../middlewares/verificarplan.middleware.js";
const router = express.Router();

// Rutas de planes
router.get("/", planController.getPlanes);
router.post("/", planController.createPlan);
router.delete("/:id", planController.deletePlan);
router.put("/:id", planController.updatePlan); 

router.post("/crear-planes", planController.crearPlanes);

export default router;
