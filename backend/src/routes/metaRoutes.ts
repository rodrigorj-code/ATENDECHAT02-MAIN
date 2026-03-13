import { Router } from "express";
import * as MetaController from "../controllers/MetaController";

const metaRoutes = Router();

metaRoutes.get("/webhook/:companyId/:connectionId", MetaController.verify);
metaRoutes.post("/webhook/:companyId/:connectionId", MetaController.handleMessage);

export default metaRoutes;
