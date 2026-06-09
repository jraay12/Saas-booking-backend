import { Request, Response, NextFunction } from "express";
import {
  createBusinessHoursSchema,
  createBusinessSchema,
} from "./validation/business.validation";
import { BusinessService } from "./business.service";
import { AuthRequest } from "../../shared/middleware/authMiddleware";
import fs from "node:fs/promises";

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

  createBusiness = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user_id = req.user?.userId;
      const data = createBusinessSchema.parse(req.body);
      const result = await this.businessService.create(
        {
          ...data,
          logo: (
            req.files as {
              logo?: Express.Multer.File[];
            }
          ).logo?.[0]
            ? `/public/business-logo/${
                (
                  req.files as {
                    logo?: Express.Multer.File[];
                  }
                ).logo?.[0].filename
              }`
            : undefined,
        },
        user_id!,
      );
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      // rollback uploaded files
      if (req.files && typeof req.files === "object") {
        const files = req.files as {
          logo?: Express.Multer.File[];
        };

        try {
          if (files.logo?.[0]) {
            await fs.unlink(files.logo[0].path);
          }
        } catch (fsErr) {
          console.error("Failed to rollback uploaded files:", fsErr);
        }
      }
      next(error);
    }
  };
}
