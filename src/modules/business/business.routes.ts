import { BusinessController } from "./business.controller";
// staff.routes.ts

import { Router } from "express";

const businessRoutes = (businessController: BusinessController): Router => {
  const routes = Router();

  routes.get("/:slug", businessController.getBusinessDetails);

  return routes;
};

export default businessRoutes;
