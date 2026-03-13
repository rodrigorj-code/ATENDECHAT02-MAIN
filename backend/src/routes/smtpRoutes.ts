import express from "express";
import isAuth from "../middleware/isAuth";
import * as SmtpConfigController from "../controllers/SmtpConfigController";

const routes = express.Router();

routes.get("/smtp-configs", isAuth, SmtpConfigController.index);
routes.post("/smtp-configs", isAuth, SmtpConfigController.store);
routes.put("/smtp-configs/:id", isAuth, SmtpConfigController.update);
routes.delete("/smtp-configs/:id", isAuth, SmtpConfigController.remove);
routes.post("/smtp-configs/:id/default", isAuth, SmtpConfigController.setDefault);

export default routes;

