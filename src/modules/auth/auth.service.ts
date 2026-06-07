import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { MembershipService } from "../membership/membership.service";
import { BusinessService } from "../business/business.service";
import { LoginDTO, RegisterDTO } from "./validation/auth.validation";
import { UserRepository } from "../user/user.repository";
import { UnAuthorized } from "../../shared/errors/UnAuthorized";
import { ConflictError } from "../../shared/errors/ConflictError";
import { BadRequestError } from "../../shared/errors/BadRequestError";

export class AuthService {
  constructor(
    private prisma: PrismaClient,

    private userService: UserService,

    private businessService: BusinessService,

    private membershipService: MembershipService,

    private userRepo: UserRepository,
  ) {}

  async register(data: RegisterDTO) {
    return await this.prisma.$transaction(async (tx) => {
      // create user
      const user = await this.userService.create(
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,

          ...(data.phone && {
            phone: data.phone,
          }),

          ...(data.avatar && {
            avatar: data.avatar,
          }),
        },
        tx,
      );

      // 4. Create JWT payload
      const tokenPayload = {
        userId: user.id,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      return {
        access_token: token,
      };
    });
  }

  async login(data: LoginDTO) {
    // 1. Find user (with memberships + business)
    const user = await this.userRepo.findByEmail(data.email);

    if (!user) {
      throw new UnAuthorized("Invalid email or password");
    }

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.password!);

    if (!isPasswordValid) {
      throw new UnAuthorized("Invalid email or password");
    }

    // 4. Create JWT payload
    const tokenPayload = {
      userId: user.id,
    };

    // 5. Sign token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // 6. Return safe response
    return {
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  async OAuth(data: {
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  }) {
    let user = await this.userRepo.findByEmailPlain(data.email);

    // 1. Create user if not exists
    if (!user) {
      user = await this.userService.createOAuthUser(data);
    }

    if (!user) {
      throw new BadRequestError("OAuth user creation failed");
    }

    // 2. Create JWT payload
    const tokenPayload = {
      userId: user.id,
    };

    // 3. Sign token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return { access_token: token, user };
  }
}
