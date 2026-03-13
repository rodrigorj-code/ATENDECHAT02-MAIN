import { Router } from "express";
import isAuth from "../middleware/isAuth";
import ActivityStageController from "../controllers/ActivityStageController";

const activityStageRoutes = Router();

activityStageRoutes.get("/activity-stages", isAuth, ActivityStageController.list);
activityStageRoutes.put("/activity-stages/bulk", isAuth, ActivityStageController.bulkSave);

export default activityStageRoutes;
