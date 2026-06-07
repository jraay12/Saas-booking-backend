import { Request, Response, NextFunction } from "express";

import fs from "node:fs/promises";

import { AuthService } from "./auth.service";

import { loginSchema, registerSchema } from "./validation/auth.validation";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);

      const {access_token} = await this.authService.register({
        ...data,

        ...(req.files &&
          typeof req.files === "object" && {
            avatar: (
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
          }),
      });

      res.status(201).json({token: access_token});
    } catch (error) {
      console.log(error);
      // rollback uploaded files
      if (req.files && typeof req.files === "object") {
        const files = req.files as {
          avatar?: Express.Multer.File[];
          logo?: Express.Multer.File[];
        };

        try {
          if (files.avatar?.[0]) {
            await fs.unlink(files.avatar[0].path);
          }

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

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);

      const result = await this.authService.login(data);
      res.status(200).json({
        message: "Successfully loggedIn",
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  };

  oauth = async (req: Request, res: Response, next: NextFunction) => {
    const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    const GOOGLE_CALLBACK_URL =
      "http%3A//localhost:3000/api/v1/auth/google/callback";

    const GOOGLE_OAUTH_SCOPES = [
      "https%3A//www.googleapis.com/auth/userinfo.email",

      "https%3A//www.googleapis.com/auth/userinfo.profile",
    ];
    const state = "some_state";
    const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
    const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
    res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
  };

  callback = async (req: Request, res: Response, next: NextFunction) => {
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

    const { code } = req.query;

    const data = {
      code,

      client_id: GOOGLE_CLIENT_ID,

      client_secret: GOOGLE_CLIENT_SECRET,

      redirect_uri: "http://localhost:3000/api/v1/auth/google/callback",

      grant_type: "authorization_code",
    };

    const response = await fetch(GOOGLE_ACCESS_TOKEN_URL!, {
      method: "POST",

      body: JSON.stringify(data),
    });

    const access_token_data = await response.json();

    const { id_token } = access_token_data;

    const token_info_response = await fetch(
      `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`,
    );

    try {
      const result = await token_info_response.json();
      const { access_token } = await this.authService.OAuth({
        avatar: result.picture,
        email: result.email,
        first_name: result.given_name,
        last_name: result.family_name,
      });
      res.status(201).json({ token: access_token });
    } catch (error) {
      next(error);
    }
  };
}
