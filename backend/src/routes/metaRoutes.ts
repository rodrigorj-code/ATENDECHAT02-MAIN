import { Router } from "express";
import * as WebHooksController from "../controllers/WebHookController";

const metaRoutes = Router();

// A Meta pode estar apontando o callback para paths diferentes.
// Para garantir que Instagram/page sejam processados do mesmo jeito,
// reaproveitamos o mesmo controller que já faz o parsing para tickets.
metaRoutes.get("/webhook/:companyId/:connectionId", WebHooksController.index as any);
metaRoutes.post("/webhook/:companyId/:connectionId", WebHooksController.webHook as any);

export default metaRoutes;
