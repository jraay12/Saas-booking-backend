// service.routes.ts

import { Router } from "express";
import { ServiceController } from "./service.controller";

const serviceRoutes = (
  serviceController: ServiceController,
): Router => {
  const routes = Router();

  routes.post("/", serviceController.createService);

  routes.get("/", serviceController.getServices);

  routes.get("/:id", serviceController.getServiceById);

  routes.patch("/:id", serviceController.updateService);

  routes.delete("/:id", serviceController.deleteService);

  return routes;
};

export default serviceRoutes;