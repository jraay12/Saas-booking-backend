import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class UserRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Prisma.UserCreateInput, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.user.create({
      data,
    });
  }

  async findByEmail(email: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: {
          include: {
            business: true,
          },
        },
      },
    });
  }

  async findByEmailPlain(email: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;
    return await client.user.findUnique({ where: { email } });
  }

  async findByPhone(phone?: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.user.findUnique({
      where: {
        phone,
      },
    });
  }

  async findById(id: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.user.findUnique({
      where: {
        id: id,
      },
      include: {
        memberships: {
          select: {
            role: true,
            business_id: true
          },
        },
      },
    });
  }
}
