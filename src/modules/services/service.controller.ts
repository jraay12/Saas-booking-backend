// service.controller.ts

import { Request, Response, NextFunction } from "express";
import { ServiceService } from "./service.service";
import fs from "node:fs/promises";

import {
  assignStaffSchema,
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

      const result = await this.serviceService.create(
        {
          ...data,
          image_path: imageFile?.path ?? null, // ✅ optional now
          business_id,
        },
        business_id,
        data.staffIds,
      );

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

  getServices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      const result = await this.serviceService.findAll(businessId!);

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

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const image = files?.image?.[0];

      const result = await this.serviceService.update(id, {
        ...data,
        ...(image && {
          image_path: image.path,
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

  assignStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = assignStaffSchema.parse(req.body);
      const business_id = req.user?.businessId!;
      const result = await this.serviceService.assignStaffToService({
        ...data,
        business_id: business_id,
      });

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  removeStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = assignStaffSchema.parse(req.body);
      const business_id = req.user?.businessId!;
      const result = await this.serviceService.removeStaffFromService(
        data,
        business_id,
      );
      return res.json(200).json({
        message: "Successfully remove",
      });
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params as { id: string };
      const business_id = req.user?.businessId!;
      const userId = req.user?.userId!;
      const result = await this.serviceService.toggleStatus(
        id,
        business_id,
        userId,
      );
      return res.status(200).json({
        message: result.is_active
          ? "Successfully activated"
          : "Successfully inactivated",
        is_active: result.is_active,
      });
    } catch (error) {
      next(error);
    }
  };

  findAllAssignedStaffService = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params as { id: string };
      const business_id = req.user?.businessId!;

      const result = await this.serviceService.findAllAssignedStaffService(
        id,
        business_id,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUnassignedStaffs = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params as { id: string };
      const business_id = req.user?.businessId!;

      const result = await this.serviceService.getUnassignedStaffs(
        id,
        business_id,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
