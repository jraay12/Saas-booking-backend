import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class BusinessRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Prisma.BusinessCreateInput, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.business.create({
      data,
    });
  }

  async findByName(business_name: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.business.findFirst({
      where: {
        business_name,
      },
    });
  }

  async findById(id: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.business.findUnique({
      where: {
        id,
      },
    });
  }

  async findBySlug(slug: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.business.findUnique({
      where: {
        slug,
      },
    });
  }
}
