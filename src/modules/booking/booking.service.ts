import { DayOfWeek } from "@prisma/client";
import { BadRequestError } from "../../shared/errors/BadRequestError";
import { BusinessHoursRepository } from "../business/businessHours.repository";
import { BookingRepository } from "./booking.repository";
import { ServiceRepository } from "../services/service.repository";

interface GetAvailabilityParams {
  business_id: string;
  service_id: string;
  staff_id: string;
  booking_date: Date;
}

export class BookingService {
  constructor(
    private businessHoursRepo: BusinessHoursRepository,
    private bookingRepo: BookingRepository,
    private serviceRepo: ServiceRepository,
  ) {}

  async getAvailableSlots({
    business_id,
    service_id,
    staff_id,
    booking_date,
  }: GetAvailabilityParams) {
    // validate service
    const service = await this.serviceRepo.findById(service_id);

    if (!service) {
      throw new Error("Service not found");
    }

    // validate staff assigned to service
    const assignedStaff = await this.serviceRepo.findAssignedStaff(
      service_id,
      staff_id,
    );

    if (!assignedStaff) {
      throw new Error("Staff is not assigned to this service");
    }

    // service duration
    const durationMinutes = service.hour * 60 + service.minute;

    // get day
    const day = this.getDayOfWeek(booking_date);

    // get business hours
    const businessHours = await this.businessHoursRepo.findByDay(
      business_id,
      day,
    );

    if (!businessHours || businessHours.is_closed) {
      throw new BadRequestError("It is closed today");
    }

    // get existing staff bookings
    const bookings = await this.bookingRepo.findBookingsByStaffAndDate(
      staff_id,
      booking_date,
    );

    // generate slots
    const slots = this.generateTimeSlots(
      businessHours.open_time,
      businessHours.close_time,
      durationMinutes,
    );

    // remove occupied slots
    const availableSlots = slots.filter((slot) =>
      this.isSlotAvailable(slot, durationMinutes, bookings),
    );


    return availableSlots;
  }

  private generateTimeSlots(
    openTime: string,
    closeTime: string,
    durationMinutes: number,
  ) {
    const slots: string[] = [];

    const [openHour, openMinute] = openTime.split(":").map(Number);

    const [closeHour, closeMinute] = closeTime.split(":").map(Number);

    const start = new Date();

    start.setHours(openHour, openMinute, 0, 0);

    const end = new Date();

    end.setHours(closeHour, closeMinute, 0, 0);

    while (start < end) {
      const slotStart = new Date(start);

      const slotEnd = new Date(start);

      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

      // stop if exceeds business hours
      if (slotEnd > end) {
        break;
      }

      slots.push(slotStart.toTimeString().slice(0, 5));

      start.setMinutes(start.getMinutes() + durationMinutes);
    }

    return slots;
  }

  private isSlotAvailable(
    slot: string,
    durationMinutes: number,
    bookings: {
      start_time: string;
      end_time: string;
    }[],
  ) {
    const slotStart = this.toMinutes(slot);

    const slotEnd = slotStart + durationMinutes;

    return !bookings.some((booking) => {
      const bookingStart = this.toMinutes(booking.start_time);

      const bookingEnd = this.toMinutes(booking.end_time);

      // overlap detection
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  private toMinutes(time: string) {
    const [hour, minute] = time.split(":").map(Number);

    return hour * 60 + minute;
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    return days[date.getDay()];
  }
}
