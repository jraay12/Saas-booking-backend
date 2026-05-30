// staff.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { BusinessHoursController } from "./businessHours.controller";

const businessHoursRoutes = (
  businessHoursController: BusinessHoursController,
): Router => {
  const routes = Router();

  routes.post("/", authMiddleware, businessHoursController.createBusinessHours);
  routes.get("/", authMiddleware, businessHoursController.getBusinessHours);
  routes.get("/:business_id/public", businessHoursController.getBusinessHoursPublic);
  return routes;
};

export default businessHoursRoutes;
