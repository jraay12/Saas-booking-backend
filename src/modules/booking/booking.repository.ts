import { PrismaClient as PrismaClientType, Prisma } from "@prisma/client";

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

      orderBy: {
        start_time: "asc",
      },
    });
  }
}
