import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";
import { NotFoundError } from "../../shared/errors/NotFoundError";

type PrismaTx = Prisma.TransactionClient;

export class ServiceRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(
    data: Prisma.ServiceCreateInput,
    businessId: string,
    staffIds?: string[],
    tx?: PrismaTx,
  ) {
    const client = tx ?? this.prisma;
    return await client.service.create({
      data: {
        ...data,
        ...(staffIds &&
          staffIds.length > 0 &&
          businessId && {
            serviceStaff: {
              createMany: {
                data: staffIds.map((staffId) => ({
                  business_id: businessId,
                  staff_id: staffId,
                })),
              },
            },
          }),
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.service.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(businessId: string) {
    return await this.prisma.service.findMany({
      where: {
        business_id: businessId,
      },
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
    data: { businessId: string; serviceId: string; staffIds: string[] },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.serviceStaff.createMany({
      data: data.staffIds.map((item) => ({
        service_id: data.serviceId,
        business_id: data.businessId,
        staff_id: item,
      })),
    });
  }

  async findByServiceAndStaff(
    service_id: string,
    staff_ids: string[],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.serviceStaff.findMany({
      where: { service_id, staff_id: { in: staff_ids } },
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

  async removeAllByStaff(user_id: string, business_id: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    return await client.serviceStaff.deleteMany({
      where: {
        staff_id: user_id,
        business_id,
      },
    });
  }

  async toggleStatus(id: string, businessId: string, tx?: PrismaTx) {
    const client = tx ?? this.prisma;

    const currentToggleState = await client.service.findFirst({
      where: {
        id,
        business_id: businessId,
      },
    });

    if (!currentToggleState) throw new NotFoundError("Service not found");

    return await client.service.update({
      where: {
        id,
        business_id: businessId,
      },
      data: {
        is_active: !currentToggleState.is_active,
      },
    });
  }

  async findByServiceBusinessId(service_id: string, business_id: string) {
    return await this.prisma.service.findFirst({
      where: {
        id: service_id,
        business_id: business_id,
      },
    });
  }

  async findAllAssignedStaff(service_id: string, business_id: string) {
    return await this.prisma.serviceStaff.findMany({
      where: {
        business_id,
        service_id,
      },
      include: {
        staff: {
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
