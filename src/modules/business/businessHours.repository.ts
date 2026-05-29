import {
  PrismaClient as PrismaClientType,
  Prisma,
  DayOfWeek,
} from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class BusinessHoursRepository {
  constructor(private prisma: PrismaClientType) {}

  async upsert(
    businessId: string,
    data: {
      is_closed: boolean;
      day: DayOfWeek;
      open_time: string;
      close_time: string;
    },
    tx?: PrismaTx,
  ) {
    const client = tx ?? this.prisma;

    return await client.businessHour.upsert({
      where: {
        business_id_day: {
          business_id: businessId,
          day: data.day,
        },
      },
      create: {
        business_id: businessId,
        day: data.day,
        open_time: data.open_time,
        close_time: data.close_time,
        is_closed: data.is_closed,
      },
      update: {
        open_time: data.open_time,
        close_time: data.close_time,
        is_closed: data.is_closed,
      },
    });
  }
}
