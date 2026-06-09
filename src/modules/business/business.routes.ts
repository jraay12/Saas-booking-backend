import { upload } from "../../lib/multer";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { BusinessController } from "./business.controller";
// staff.routes.ts

import { Router } from "express";

const businessRoutes = (businessController: BusinessController): Router => {
  const routes = Router();

  routes.get("/:slug", businessController.getBusinessDetails);
  routes.post(
    "/",
    authMiddleware,
    upload.fields([{ name: "logo", maxCount: 1 }]),
    businessController.createBusiness,
  );
  return routes;
};

export default businessRoutes;
