import express from "express";
import isAuth from "../middleware/isAuth";
import * as LeadsSalesController from "../controllers/LeadsSalesController";

const routes = express.Router();

routes.get("/leads-sales", isAuth, LeadsSalesController.index);
routes.get("/leads-sales/dashboard", isAuth, LeadsSalesController.dashboard);
routes.get("/leads-sales/:id", isAuth, LeadsSalesController.show);
routes.post("/leads-sales", isAuth, LeadsSalesController.store);
routes.put("/leads-sales/:id", isAuth, LeadsSalesController.update);
routes.delete("/leads-sales/:id", isAuth, LeadsSalesController.remove);

export default routes;

