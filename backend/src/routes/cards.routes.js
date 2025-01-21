import { Router } from "express"; 
import cardsController from "../controllers/cards.controller.js"; 
// import authenticationMiddleware from "../middlewares/authentication.middleware.js"; 
import { isAdmin } from "../middlewares/authorization.middleware.js";   

const router = Router();
// Funciones CARDS - MP
router.post("/guardar-tarjeta", cardsController.createCardMP); 
router.get("/tarjeta/:id", cardsController.getCardByIdMP);
router.get("/cliente/tarjetaId/:id/:cardId", cardsController.getCardByClient); 
router.put("/tarjeta/:id", cardsController.updateCardMP);
router.delete("/tarjeta/:id", cardsController.deleteCardMP); 

// Funciones CARDS - BD 
router.post("/guardar-tarjeta-bd", cardsController.createCard);
router.get("/cliente/:id", cardsController.getCardByCustomerId);
router.get("/tarjeta/:id", cardsController.getCardById);
router.get("/tarjeta-token/:id", cardsController.getCardByCardTokenId);
router.get("/tarjetas", cardsController.getCards);
router.get("/tarjeta-user/:id", cardsController.getCardByUserId);
router.put("/tarjeta-user/:id", cardsController.updateCardByUserId);
router.put("/tarjeta/:id", cardsController.updateCard);
router.delete("/tarjeta/:id", cardsController.deleteCard);
router.delete("/tarjeta-user/:id", cardsController.deleteCardByUserId);


export default router; 

