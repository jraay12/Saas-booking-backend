import { AuthRequest } from "../../shared/middleware/authMiddleware";
import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import {
  CreateBookingDtoSchema,
  getAvailabilitySchema,
} from "./validator/booking.validator";

export class BookingController {
  constructor(private bookingService: BookingService) {}

  getAvailableSlots = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { business_id } = req.params as { business_id: string };
      const validatedQuery = getAvailabilitySchema.parse(req.query);
      const result = await this.bookingService.getAvailableSlots({
        business_id,
        service_id: validatedQuery.service_id,
        staff_id: validatedQuery.staff_id,
        booking_date: new Date(validatedQuery.date),
      });
      res.status(200).json({
        message: "Available slots fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { business_id } = req.params as { business_id: string };

      const validatedBody = CreateBookingDtoSchema.parse(req.body);

      const result = await this.bookingService.createBookings(
        validatedBody,
        business_id,
      );

      res.status(201).json({
        message: "Booking created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  fetchAllBookings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.user?.businessId!;
      const result = await this.bookingService.fetchAllBookings(business_id);

      res.status(201).json({
        message: "Successfully fetched all bookings",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
