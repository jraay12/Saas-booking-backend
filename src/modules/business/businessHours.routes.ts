// staff.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { BusinessHoursController } from "./businessHours.controller";

const businessHoursRoutes = (
  businessHoursController: BusinessHoursController,
): Router => {
  const routes = Router();

  routes.post("/", authMiddleware, businessHoursController.createBusinessHours);

  return routes;
};

export default businessHoursRoutes;
