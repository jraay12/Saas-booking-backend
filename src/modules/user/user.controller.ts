import { Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";

import { UserService } from "./user.service";

import { createUserSchema } from "./validation/user.validation";

export class UserController {
  constructor(private userService: UserService) {}

  createUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
          console.error(
            "Failed to delete orphaned avatar:",
            fsErr,
          );
        }
      }

      next(error);
    }
  };
}