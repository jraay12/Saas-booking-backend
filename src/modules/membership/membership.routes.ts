// staff.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { MembershipController } from "./membership.controller";

const membershipRoutes = (
  membershipController: MembershipController,
): Router => {
  const routes = Router();

  routes.get(
    "/",
    authMiddleware,
    membershipController.findAllMembers,
  );

  return routes;
};

export default membershipRoutes;
