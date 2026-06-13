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
            last_name: true,
          },
        },
        service: {
          select: {
            service_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async updateBooking(
    id: string,
    data: Prisma.BookingUpdateInput,
    tx?: PrismaTx,
  ) {
    const client = tx ?? this.prisma;
    return await client.booking.update({
      where: {
        id,
      },
      data,
    });
  }

  async findById(id: string) {
    return await this.prisma.booking.findUnique({
      where: {
        id,
      },
    });
  }

  async getDashboardStats(business_id: string) {
    const [totalBookings, statusCounts, revenue] = await Promise.all([
      this.prisma.booking.count({
        where: { business_id },
      }),

      this.prisma.booking.groupBy({
        by: ["status"],
        where: { business_id },
        _count: true,
      }),

      this.prisma.booking.aggregate({
        where: {
          business_id,
          status: "COMPLETED",
        },
        _sum: {
          service_price: true,
        },
      }),
    ]);

    return {
      totalBookings,
      statusCounts,
      revenue: revenue._sum.service_price ?? 0,
    };
  }

  async getRevenueBookings(business_id: string, from: Date) {
    return this.prisma.booking.findMany({
      where: {
        business_id,
        status: "COMPLETED",
        booking_date: {
          gte: from,
        },
      },
      select: {
        booking_date: true,
        service_price: true,
      },
    });
  }

  async getTodayScheduleBookings(business_id: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.booking.findMany({
      where: {
        business_id,
        status: "CONFIRMED",
        booking_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      take: 5,
      orderBy: {
        start_time: "asc",
      },
      include: {
        service: {
          select: {
            service_name: true,
            hour: true,
            minute: true,
          },
        },
        staff: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

   async getTodayScheduleBookingsByStaff(business_id: string, staff_id: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.booking.findMany({
      where: {
        business_id,
        status: "CONFIRMED",
        staff_id,
        booking_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      take: 5,
      orderBy: {
        start_time: "asc",
      },
      include: {
        service: {
          select: {
            service_name: true,
            hour: true,
            minute: true,
          },
        },
        staff: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }
}
