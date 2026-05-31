// staff.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware";
import { BookingController } from "./booking.controller";
const bookingRoutes = (bookingController: BookingController): Router => {
  const routes = Router();

  routes.get("/available/:business_id", bookingController.getAvailableSlots);
  routes.post("/:business_id", bookingController.createBooking);
  routes.get("/", authMiddleware, bookingController.fetchAllBookings);
  routes.patch(
    "/:id/confirm",
    authMiddleware,
    bookingController.confirmBooking,
  );
  routes.patch(
    "/:id/cancel",
    authMiddleware,
    bookingController.cancelBooking,
  );

  return routes;
};

export default bookingRoutes;
