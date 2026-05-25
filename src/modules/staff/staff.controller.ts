import { Response, NextFunction } from "express";
import fs from "fs/promises";
import { AuthRequest } from "../../shared/middleware/authMiddleware";
import { createStaffSchema } from "./validation/staff.validation";

class StaffController {
  constructor(private staffService: any) {}

  createStaff = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. validate body
      const data = createStaffSchema.parse(req.body);

      // 2. get business from JWT
      const business_id = req.user?.businessId;

      if (!business_id) {
        return res.status(403).json({ message: "Business not found in token" });
      }

      // 3. extract file from fields()
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      } | undefined;

      const avatarFile = files?.avatar?.[0];

      const result = await this.staffService.createStaff({
        ...data,
        business_id,
        avatar: avatarFile?.path ?? null,
      });

      return res.status(201).json(result);
    } catch (error) {
      // cleanup uploaded file on error
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      } | undefined;

      const avatarFile = files?.avatar?.[0];

      if (avatarFile) {
        try {
          await fs.unlink(avatarFile.path);
        } catch (err) {
          console.error("Failed to delete file:", err);
        }
      }

      next(error);
    }
  };
}

export default StaffController;