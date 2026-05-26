import { Prisma, PrismaClient, Role } from "@prisma/client";

import { ConflictError } from "../../shared/errors/ConflictError";

import { MembershipRepository } from "./membership.repository";

import { CreateMembershipDTO } from "./validation/membership.validation";
import { ForbbidenError } from "../../shared/errors/ForbiddenError";
import { ServiceRepository } from "../services/service.repository";
import { UserRepository } from "../user/user.repository";

export class MembershipService {
  constructor(
    private membershipRepo: MembershipRepository,
    private serviceRepo: ServiceRepository,
    private prisma: PrismaClient,
  ) {}

  async create(data: CreateMembershipDTO, tx?: Prisma.TransactionClient) {
    const existingMembership = await this.membershipRepo.findByUserAndBusiness(
      data.user_id,
      data.business_id,
      tx,
    );

    if (existingMembership) {
      throw new ConflictError("Membership already exists");
    }

    const payload: Prisma.MembershipCreateInput = {
      role: data.role as Role,

      user: {
        connect: {
          id: data.user_id,
        },
      },

      business: {
        connect: {
          id: data.business_id,
        },
      },
    };

    return await this.membershipRepo.create(payload, tx);
  }

  async assertStaffMember(
    user_id: string,
    business_id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const membership = await this.membershipRepo.findByUserAndBusiness(
      user_id,
      business_id,
      tx,
    );

    if (!membership) {
      throw new ForbbidenError("User is not a member of this business");
    }

    if (membership.role !== Role.STAFF) {
      throw new ForbbidenError("User is not a staff member");
    }

    return membership;
  }

  async assertOwner(
    user_id: string,
    business_id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const membership = await this.membershipRepo.findByUserAndBusiness(
      user_id,
      business_id,
      tx,
    );

    if (!membership) {
      throw new ForbbidenError("User is not a member of this business");
    }

    if (membership.role !== Role.OWNER) {
      throw new ForbbidenError("User is not the Owner");
    }

    return membership;
  }

  async findAllMembers(business_id: string) {
    return await this.membershipRepo.findAllMembers(business_id);
  }

  async removeStaff(user_id: string, business_id: string) {
    await this.assertStaffMember(user_id, business_id);

    return await this.prisma.$transaction(async (tx) => {
      await this.serviceRepo.removeAllByStaff(user_id, business_id, tx);

      await this.membershipRepo.removeStaffMember(user_id, business_id, tx);
    });
  }
}
