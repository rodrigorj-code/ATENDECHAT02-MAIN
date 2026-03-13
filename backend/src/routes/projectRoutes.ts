import express from "express";
import isAuth from "../middleware/isAuth";
import * as ProjectController from "../controllers/ProjectController";

const projectRoutes = express.Router();

projectRoutes.get("/projects", isAuth, ProjectController.index);
projectRoutes.post("/projects", isAuth, ProjectController.store);
projectRoutes.put("/projects/:projectId", isAuth, ProjectController.update);
projectRoutes.delete("/projects/:projectId", isAuth, ProjectController.remove);

export default projectRoutes;
