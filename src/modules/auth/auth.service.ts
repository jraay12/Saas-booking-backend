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

      // create business
      const business = await this.businessService.create(
        {
          business_name: data.business_name,

          category: data.category,

          ...(data.description && {
            description: data.description,
          }),

          ...(data.business_email && {
            email: data.business_email,
          }),

          ...(data.business_phone && {
            phone: data.business_phone,
          }),

          ...(data.address && {
            address: data.address,
          }),

          ...(data.logo && {
            logo: data.logo,
          }),
        },
        tx,
      );

      // create membership
      await this.membershipService.create(
        {
          user_id: user.id,
          business_id: business.id,
          role: "OWNER",
        },
        tx,
      );

      return {
        user,
        business,
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

    // 3. Get membership (for now: first business)
    const membership = user.memberships?.[0];

    if (!membership) {
      throw new UnAuthorized("User has no assigned business");
    }

    const business = membership.business;

    if (!business) {
      throw new UnAuthorized("Business not found");
    }

    // 4. Create JWT payload
    const tokenPayload = {
      userId: user.id,
      businessId: business.id,
      role: membership.role,
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
      business: {
        id: business.id,
        business_name: business.business_name,
        slug: business.slug,
      },
      role: membership.role,
    };
  }

  async OAuth(data: {
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  }) {
    await this.userService.createOAuthUser(data);
  }
}
