import { Prisma, Role } from "@prisma/client";

import { ConflictError } from "../../shared/errors/ConflictError";

import { MembershipRepository } from "./membership.repository";

import { CreateMembershipDTO } from "./validation/membership.validation";
import { ForbbidenError } from "../../shared/errors/ForbiddenError";

export class MembershipService {
  constructor(private membershipRepo: MembershipRepository) {}

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

  async findAllMembers(business_id: string) {
    return await this.membershipRepo.findAllMembers(business_id);
  }
}
