import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class ServiceRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Prisma.ServiceCreateInput, tx?: PrismaTx) {
    const client = tx ?? this.prisma;
    return await client.service.create({
      data,
    });
  }

  async findById(id: string) {
    return await this.prisma.service.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return await this.prisma.service.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.service.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.service.delete({
      where: {
        id,
      },
    });
  }
}
