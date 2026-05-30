// staff.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { BookingController } from "./booking.controller";
const bookingRoutes = (bookingController: BookingController): Router => {
  const routes = Router();

  routes.get("/available/:business_id", bookingController.getAvailableSlots); 

  return routes;
};

export default bookingRoutes;
