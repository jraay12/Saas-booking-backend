import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class MembershipRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Prisma.MembershipCreateInput, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.membership.create({
      data,
    });
  }

  async findByUserAndBusiness(
    user_id: string,
    business_id: string,
    tx?: PrismaTx,
  ) {
    const client = tx ?? this.prisma;

    return await client.membership.findUnique({
      where: {
        user_id_business_id: {
          user_id,
          business_id,
        },
      },
    });
  }

  async findStaffMember(user_id: string, business_id: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.membership.findFirst({
      where: {
        user_id,
        business_id,
        role: "STAFF",
      },
      include: {
        user: true,
      },
    });
  }

  async findAllMembers(business_id: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.membership.findMany({
      where: {
        business_id,
        role: "STAFF",
      },
      include: {
        user: {
          select: {
            id: true,
            avatar: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }
}
