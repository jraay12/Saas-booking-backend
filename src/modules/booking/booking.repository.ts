import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";

type PrismaTx = Prisma.TransactionClient;

export class BookingRepository {
  constructor(private prisma: PrismaClientType) {}

  async findBookingsByStaffAndDate(staff_id: string, booking_date: Date) {
    const startOfDay = new Date(booking_date);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(booking_date);

    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.booking.findMany({
      where: {
        staff_id,

        booking_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        service: {
          select: {
            hour: true,
            minute: true,
          },
        },
      },

      orderBy: {
        start_time: "asc",
      },
    });
  }

  async create(data: Prisma.BookingCreateInput, tx?: PrismaTx) {
    const client = tx ?? this.prisma;
    return await client.booking.create({
      data,
    });
  }

  async getBookings(business_id: string) {
    return await this.prisma.booking.findMany({
      where: {
        business_id,
      },
      include: {
        staff: {
          select: {
            first_name: true,
            last_name: true
          }
        },
        service: {
          select: {
            service_name: true
          }
        }
      }
    });
  }
}
