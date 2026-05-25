import { Router } from "express";

import { UserController } from "./user.controller";
import { avatarUpload } from "../../lib/multer";

const userRoutes = (
  userController: UserController,
): Router => {
  const routes = Router();

  routes.post("/", avatarUpload.single("image"), userController.createUser);

  return routes;
};

export default userRoutes;