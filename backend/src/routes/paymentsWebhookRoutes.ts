import { Router } from "express";
import { webhook as caktoWebhook } from "../controllers/CaktoPaymentsController";

const router = Router();

router.post("/webhook", caktoWebhook);

export default router;
