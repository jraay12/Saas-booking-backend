import { BookingRepository } from "../booking/booking.repository";

export class DashboardService {
  constructor(private bookingRepo: BookingRepository) {}

  async dashboard(business_id: string) {
    const today = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const [bookings7d, bookings30d, stats, todaysBookings] = await Promise.all([
      this.bookingRepo.getRevenueBookings(business_id, sevenDaysAgo),
      this.bookingRepo.getRevenueBookings(business_id, thirtyDaysAgo),
      this.bookingRepo.getDashboardStats(business_id),
      this.bookingRepo.getTodayScheduleBookings(business_id),
    ]);

    const getCount = (status: string) =>
      stats.statusCounts.find((s) => s.status === status)?._count ?? 0;

    // =========================
    // REVENUE BUILDERS
    // =========================

    const build7DayRevenue = () => {
      const labels: string[] = [];
      const revenue: number[] = [];

      const today = new Date();

      // 0 = Sunday, 1 = Monday ...
      const dayOfWeek = today.getDay();

      // Calculate how many days to go back to reach Monday
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));

        const total = bookings7d
          .filter(
            (b) =>
              new Date(b.booking_date).toDateString() === date.toDateString(),
          )
          .reduce((sum, b) => sum + b.service_price.toNumber(), 0);

        revenue.push(total);
      }

      return {
        labels,
        revenue,
        target: Array(7).fill(10000),
      };
    };

    const buildMonthlyRevenue = () => {
      const revenue = [0, 0, 0, 0, 0];

      bookings30d.forEach((b) => {
        const date = new Date(b.booking_date);

        const weekIndex = Math.floor((date.getDate() - 1) / 7);

        revenue[weekIndex] += b.service_price.toNumber();
      });

      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
        revenue,
        target: Array(5).fill(50000),
      };
    };

    const cleanTodaysBookings = todaysBookings.map((item) => {
      const hours = item.service.hour ?? 0;
      const minutes = item.service.minute ?? 0;

      const durationParts: string[] = [];

      if (hours > 0) {
        durationParts.push(`${hours}h`);
      }

      if (minutes > 0) {
        durationParts.push(`${minutes}m`);
      }

      return {
        id: item.id,
        time: item.start_time,
        client: `${item.first_name} ${item.last_name}`,
        service: item.service.service_name,
        status: item.status,
        duration: durationParts.join(" "),
        staff: `${item.staff.first_name} ${item.staff.last_name}`,
      };
    });

    return {
      stats: {
        totalBookings: stats.totalBookings,
        totalConfirmedBookings: getCount("CONFIRMED"),
        totalPendingBookings: getCount("PENDING"),
        revenue: Number(stats.revenue ?? 0),
      },

      STATUS_DONUT: {
        labels: ["Confirmed", "Completed", "Pending", "Cancelled"],
        data: [
          getCount("CONFIRMED"),
          getCount("COMPLETED"),
          getCount("PENDING"),
          getCount("CANCELLED"),
        ],
        colors: ["#185FA5", "#1D9E75", "#EF9F27", "#E24B4A"],
      },

      REVENUE_DATA: {
        "7d": build7DayRevenue(),
        "30d": buildMonthlyRevenue(),
      },
      TODAY_SCHEDULE: cleanTodaysBookings,
    };
  }
}
