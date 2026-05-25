import { PrismaClient } from "@prisma/client";
import { MembershipService } from "../membership/membership.service";
import { UserService } from "../user/user.service";
import { CreateStaffDTO } from "./validation/staff.validation";

export class StaffService {
  constructor(
    private userService: UserService,
    private membershipService: MembershipService,
    private prisma: PrismaClient
  ) {}

  async createStaff(data: CreateStaffDTO) {
    return await this.prisma.$transaction(async (tx) => {
      
      const user = await this.userService.create(
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          avatar: data.avatar
        },
        tx
      );

      const membership = await this.membershipService.create(
        {
          user_id: user.id,
          business_id: data.business_id!,
          role: "STAFF",
        },
        tx
      );

      return { user, membership };
    });
  }
}