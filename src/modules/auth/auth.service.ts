import { PrismaClient } from "@prisma/client";

import { UserService } from "../user/user.service";
import { MembershipService } from "../membership/membership.service";
import { BusinessService } from "../business/business.service";
import { RegisterDTO } from "./validation/auth.validation";

export class AuthService {
  constructor(
    private prisma: PrismaClient,

    private userService: UserService,

    private businessService: BusinessService,

    private membershipService: MembershipService,
  ) {}

  async register(data: RegisterDTO) {
    return await this.prisma.$transaction(
      async (tx) => {
        // create user
        const user =
          await this.userService.create(
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
        const business =
          await this.businessService.create(
            {
              business_name:
                data.business_name,

              category: data.category,

              ...(data.description && {
                description:
                  data.description,
              }),

              ...(data.business_email && {
                email:
                  data.business_email,
              }),

              ...(data.business_phone && {
                phone:
                  data.business_phone,
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
      },
    );
  }
}