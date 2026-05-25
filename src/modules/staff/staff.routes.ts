// staff.routes.ts

import { Router } from "express";
import { upload } from "../../lib/multer";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import StaffController from "./staff.controller";

const staffRoutes = (staffController: StaffController): Router => {
  const routes = Router();

  routes.post(
    "/",
    authMiddleware,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    staffController.createStaff
  );

  return routes;
};

export default staffRoutes;