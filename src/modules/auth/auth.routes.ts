import { Router } from "express";

import { AuthController } from "./auth.controller";

import { upload } from "../../lib/multer";

const authRoutes = (
  authController: AuthController,
): Router => {
  const routes = Router();

  routes.post(
    "/register",

    upload.fields([
      {
        name: "avatar",
        maxCount: 1,
      },

      {
        name: "logo",
        maxCount: 1,
      },
    ]),

    authController.register,
  );

  return routes;
};

export default authRoutes;