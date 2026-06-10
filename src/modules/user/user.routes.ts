import { Router } from "express";

import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";
import { authMiddleware } from "../../shared/middleware/authMiddleware";

const userRoutes = (userController: UserController): Router => {
  const routes = Router();

  routes.post(
    "/",
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    userController.createUser,
  );
  routes.get("/me", authMiddleware, userController.myProfile);

  routes.get("/:id", userController.findById);

  routes.patch(
    "/:id",
    authMiddleware,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    userController.updateUser,
  );

  return routes;
};

export default userRoutes;
