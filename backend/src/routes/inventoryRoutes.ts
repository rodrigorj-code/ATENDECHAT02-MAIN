import express from "express";
import isAuth from "../middleware/isAuth";
import * as InventoryController from "../controllers/InventoryController";
import multer from "multer";
import uploadConfig from "../config/upload";

const routes = express.Router();
const upload = multer(uploadConfig);

routes.get("/inventory", isAuth, InventoryController.index);
routes.get("/inventory/:id", isAuth, InventoryController.show);
routes.post("/inventory", isAuth, InventoryController.store);
routes.put("/inventory/:id", isAuth, InventoryController.update);
routes.delete("/inventory/:id", isAuth, InventoryController.remove);
routes.post("/inventory/import", isAuth, upload.single("file"), InventoryController.importFile);

export default routes;
