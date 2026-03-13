import { Router } from "express";
import isAuth from "../middleware/isAuth";
import LeadPipelineController from "../controllers/LeadPipelineController";

const leadPipelineRoutes = Router();

leadPipelineRoutes.get("/lead-pipelines", isAuth, LeadPipelineController.list);
leadPipelineRoutes.put("/lead-pipelines/bulk", isAuth, LeadPipelineController.bulkSave);

export default leadPipelineRoutes;
