import { Router } from "express"; 
import paymentController from "../controllers/payment.controller.js"; 

const router = Router();

router.post("/webhook", paymentController.webhook);
router.post("/refund/:paymentId", paymentController.refundPayment);

export default router;
