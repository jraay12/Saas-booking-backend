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
      const business_id = req.headers["x-business-id"] as string;

      if (!business_id) {
        res.status(400).json({ message: "Business ID is required" });
        return;
      }
      const result = await this.bookingService.fetchAllBookings(business_id);

      res.status(201).json({
        message: "Successfully fetched all bookings",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  confirmBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.headers["x-business-id"] as string;

      if (!business_id) {
        res.status(400).json({ message: "Business ID is required" });
        return;
      }
      const user_id = req.user?.userId!;
      const { id } = req.params as { id: string };
      const result = await this.bookingService.confirmBooking(
        id,
        user_id,
        business_id,
      );

      res.status(201).json({
        message: `Successfully confirm the booking of ${result.first_name} ${result.last_name}`,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.headers["x-business-id"] as string;

      if (!business_id) {
        res.status(400).json({ message: "Business ID is required" });
        return;
      }
      const user_id = req.user?.userId!;
      const { id } = req.params as { id: string };
      const result = await this.bookingService.cancelBooking(
        id,
        user_id,
        business_id,
      );

      res.status(201).json({
        message: `Successfully cancel the booking of ${result.first_name} ${result.last_name}`,
      });
    } catch (error) {
      next(error);
    }
  };
}
