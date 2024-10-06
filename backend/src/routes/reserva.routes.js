"use strict";

import { Router } from "express";

// import enlaceController from "../controllers/enlace.controller.js";
// import { isAdmin } from "../middlewares/authorization.middleware.js"; 

import authentificationMiddleware from "../middlewares/authentication.middleware.js"; 

const router = Router();  

router.use(authentificationMiddleware); 

export default router;
