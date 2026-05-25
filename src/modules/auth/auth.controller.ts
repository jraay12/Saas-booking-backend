import {
  Request,
  Response,
  NextFunction,
} from "express";

import fs from "node:fs/promises";

import { AuthService } from "./auth.service";

import { loginSchema, registerSchema } from "./validation/auth.validation";

export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = registerSchema.parse(
        req.body,
      );

      const result =
        await this.authService.register({
          ...data,

          ...(req.files &&
            typeof req.files === "object" && {
              avatar:
                (
                  req.files as {
                    avatar?: Express.Multer.File[];
                  }
                ).avatar?.[0]
                  ? `/public/avatar/${
                      (
                        req.files as {
                          avatar?: Express.Multer.File[];
                        }
                      ).avatar?.[0].filename
                    }`
                  : undefined,

              logo:
                (
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
            }),
        });

      res.status(201).json(result);
    } catch (error) {
      console.log(error)
      // rollback uploaded files
      if (
        req.files &&
        typeof req.files === "object"
      ) {
        const files = req.files as {
          avatar?: Express.Multer.File[];
          logo?: Express.Multer.File[];
        };

        try {
          if (files.avatar?.[0]) {
            await fs.unlink(
              files.avatar[0].path,
            );
          }

          if (files.logo?.[0]) {
            await fs.unlink(
              files.logo[0].path,
            );
          }
        } catch (fsErr) {
          console.error(
            "Failed to rollback uploaded files:",
            fsErr,
          );
        }
      }

      next(error);
    }
  };

  login = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(
        req.body,
      );

      const result = await this.authService.login(data)
      res.status(200).json({
        message: "Successfully loggedIn",
        token: result.token
      })
    } catch (error) {
      next(error)
    }
  }
}