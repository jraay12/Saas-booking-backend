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

  routes.post("/login", authController.login)

  routes.get('/', authController.oauth)
  routes.get("/google/callback", authController.callback)

  return routes;
};

export default authRoutes;