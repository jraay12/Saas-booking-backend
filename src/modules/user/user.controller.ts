import { Request, Response, NextFunction } from "express";

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

      const result = await this.userService.create(data);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}