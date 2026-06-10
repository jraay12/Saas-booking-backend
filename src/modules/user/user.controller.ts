import { Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";

import { UserService } from "./user.service";

import { createUserSchema, UpdateUserDTO } from "./validation/user.validation";
import { AuthRequest } from "../../shared/middleware/authMiddleware";

export class UserController {
  constructor(private userService: UserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createUserSchema.parse(req.body);

      const result = await this.userService.create({
        ...data,

        ...(req.file && {
          avatar: `/public/avatar/${req.file.filename}`,
        }),
      });

      res.status(201).json(result);
    } catch (error) {
      // rollback uploaded avatar if request fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);

          console.log(
            "Successfully rolled back orphaned avatar:",
            req.file.filename,
          );
        } catch (fsErr) {
          console.error("Failed to delete orphaned avatar:", fsErr);
        }
      }

      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.userService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  myProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user?.userId!;
      const result = await this.userService.findById(user_id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as {id: string};
      const dto: UpdateUserDTO = req.body;

      const files = req.files as {
        avatar?: Express.Multer.File[];
      };

      const avatar = files?.avatar?.[0];

      const result = await this.userService.update(id, dto, avatar);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
