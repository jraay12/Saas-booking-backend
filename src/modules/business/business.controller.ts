import { Request, Response, NextFunction } from "express";
import { createBusinessHoursSchema } from "./validation/business.validation";
import { BusinessService } from "./business.service";

export class BusinessController {
  constructor(private businessService: BusinessService) {}

  getBusinessDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { slug } = req.params as { slug: string };
      const result = await this.businessService.findBySlug(slug);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
