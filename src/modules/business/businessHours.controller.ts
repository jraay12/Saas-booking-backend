import { AuthRequest } from "../../shared/middleware/authMiddleware";
import { BusinessHoursService } from "./businessHours.service";
import { Request, Response, NextFunction } from "express";
import { createBusinessHoursSchema } from "./validation/business.validation";

export class BusinessHoursController {
  constructor(private BusinessHoursService: BusinessHoursService) {}

  createBusinessHours = async (
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
      const data = createBusinessHoursSchema.parse(req.body);
      const result = await this.BusinessHoursService.create(data, business_id);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getBusinessHours = async (
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
      const result =
        await this.BusinessHoursService.getBusinessHours(business_id);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getBusinessHoursPublic = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { business_id } = req.params as { business_id: string };
      const result =
        await this.BusinessHoursService.getBusinessHours(business_id);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
