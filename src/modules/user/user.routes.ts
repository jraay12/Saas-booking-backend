import { Router } from "express";

import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";

const userRoutes = (
  userController: UserController,
): Router => {
  const routes = Router();

  routes.post("/", upload.fields([
    {name: "avatar", maxCount: 1}
  ]), userController.createUser);

  routes.get("/:id", userController.findById)

  return routes;
};

export default userRoutes;