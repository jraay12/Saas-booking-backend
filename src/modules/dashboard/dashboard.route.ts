// staff.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { DashbboardController } from "./dashboard.controller";
const dashboardRoutes = (
  dashbboardController: DashbboardController,
): Router => {
  const routes = Router();

  routes.get("/", authMiddleware, dashbboardController.dashboard);

  return routes;
};

export default dashboardRoutes;
