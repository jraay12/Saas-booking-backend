// service.routes.ts

import { Router } from "express";
import { ServiceController } from "./service.controller";
import { upload } from "../../lib/multer";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
const serviceRoutes = (serviceController: ServiceController): Router => {
  const routes = Router();

  routes.post(
    "/",
    authMiddleware,
    upload.fields([{ name: "image", maxCount: 1 }]),
    serviceController.createService,
  );

  routes.get("/", serviceController.getServices);

  routes.get("/:id", serviceController.getServiceById);

  routes.patch(
    "/:id",
    upload.fields([{ name: "image", maxCount: 1 }]),
    serviceController.updateService,
  );

  routes.delete("/:id",  serviceController.deleteService);

  return routes;
};

export default serviceRoutes;
