import {
  PrismaClient as PrismaClientType,
  Prisma,
} from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class MembershipRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(
    data: Prisma.MembershipCreateInput,
    tx?: PrismaTx,
  ) {
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
}