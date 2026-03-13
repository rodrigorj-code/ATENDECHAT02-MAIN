import express from "express";
import isAuth from "../middleware/isAuth";
import * as EmailAnalyticsController from "../controllers/EmailAnalyticsController";

const routes = express.Router();

routes.get("/email/analytics/summary", isAuth, EmailAnalyticsController.summary);
routes.get("/email/analytics/series", isAuth, EmailAnalyticsController.series);
routes.get("/email/recent", isAuth, EmailAnalyticsController.recent);

export default routes;

