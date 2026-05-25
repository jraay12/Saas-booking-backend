// service.controller.ts

import { Request, Response, NextFunction } from "express";
import { ServiceService } from "./service.service";
import fs from "node:fs/promises";

import {
  createServiceSchema,
  updateServiceSchema,
} from "./validation/service.validation";
import { AuthRequest } from "../../shared/middleware/authMiddleware";

export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  createService = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = createServiceSchema.parse(req.body);

      const business_id = req.user?.businessId;

      if (!business_id) {
        return res.status(403).json({ message: "Business not found in token" });
      }

      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

      const imageFile = files?.image?.[0];

      const result = await this.serviceService.create({
        ...data,
        image_path: imageFile?.path ?? null, // ✅ optional now
        business_id,
      });

      return res.status(201).json(result);
    } catch (error) {
      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

      const imageFile = files?.image?.[0];

      // cleanup uploaded file on error
      if (imageFile) {
        try {
          await fs.unlink(imageFile.path);
          console.log("Rolled back file:", imageFile.filename);
        } catch (fsErr) {
          console.error(fsErr);
        }
      }

      next(error);
    }
  };

  getServices = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.serviceService.findAll();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getServiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.params as { id: string };

      const result = await this.serviceService.findById(params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const data = updateServiceSchema.parse(req.body);

      const result = await this.serviceService.update(id, {
        ...data,
        ...(req.file && {
          image_path: req.file.path,
        }),
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const result = await this.serviceService.delete(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
