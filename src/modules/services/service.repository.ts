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

  async assign(
    data: Prisma.ServiceStaffCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.serviceStaff.create({
      data,
    });
  }

  async findByServiceAndStaff(
    service_id: string,
    staff_id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.serviceStaff.findFirst({
      where: {
        service_id,
        staff_id,
      },
    });
  }

  async remove(
    service_id: string,
    staff_id: string,
    business_id: string,
    tx?: PrismaTx,
  ) {
    const client = tx ?? this.prisma;
    return await client.serviceStaff.deleteMany({
      where: {
        service_id,
        staff_id,
        business_id,
      },
    });
  }

  async removeAllByStaff(
    user_id: string,
    business_id: string,
    tx?: PrismaTx,
  ) {
    const client = tx ?? this.prisma;

    return await client.serviceStaff.deleteMany({
      where: {
        staff_id: user_id,
        business_id,
      },
    });
  }
}
