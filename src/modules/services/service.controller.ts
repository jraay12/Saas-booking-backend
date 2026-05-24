// service.controller.ts

import { Request, Response, NextFunction } from "express";
import { ServiceService } from "./service.service";
import fs from "node:fs/promises";

import {
  createServiceSchema,
  updateServiceSchema,
} from "./validation/service.validation";

export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  createService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createServiceSchema.parse(req.body);

      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const filePath = req.file.filename;

      const result = await this.serviceService.create({
        ...data,
        image_path: `/public/services/${filePath}`,
      });

      res.status(201).json(result);
    } catch (error) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
          console.log(
            "Successfully rolled back orphaned file:",
            req.file.filename,
          );
        } catch (fsErr) {
          console.error("Failed to delete orphaned file:", fsErr);
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

      const result = await this.serviceService.update(id, data);

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
