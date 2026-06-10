import { BookingStatus, DayOfWeek, Prisma } from "@prisma/client";
import { BadRequestError } from "../../shared/errors/BadRequestError";
import { BusinessHoursRepository } from "../business/businessHours.repository";
import { BookingRepository } from "./booking.repository";
import { ServiceRepository } from "../services/service.repository";
import { CreateBookingDto } from "./validator/booking.validator";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { MembershipRepository } from "../membership/membership.repository";
import { BusinessRepository } from "../business/business.repository";
import { MembershipService } from "../membership/membership.service";
import { ForbbidenError } from "../../shared/errors/ForbiddenError";
import { bookingProducer } from "./events/bookings.producer";

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
    private membershipRepo: MembershipRepository,
    private businessRepo: BusinessRepository,
    private membershipService: MembershipService,
  ) {}

  async getAvailableSlots({
    business_id,
    service_id,
    staff_id,
    booking_date,
  }: GetAvailabilityParams) {
    // 1. validate service
    const service = await this.serviceRepo.findById(service_id);

    if (!service) {
      throw new Error("Service not found");
    }

    // service duration (ONLY SOURCE OF TRUTH)
    const serviceDuration = service.hour * 60 + service.minute;

    // 2. validate staff assigned to service
    const assignedStaff = await this.serviceRepo.findAssignedStaff(
      service_id,
      staff_id,
    );

    if (!assignedStaff) {
      throw new Error("Staff is not assigned to this service");
    }

    // 3. get day
    const day = this.getDayOfWeek(booking_date);

    // 4. get business hours
    const businessHours = await this.businessHoursRepo.findByDay(
      business_id,
      day,
    );

    if (!businessHours || businessHours.is_closed) {
      throw new BadRequestError("It is closed today");
    }

    // 5. existing bookings (IMPORTANT: include service duration)
    const bookings = await this.bookingRepo.findBookingsByStaffAndDate(
      staff_id,
      booking_date,
    );

    // 6. generate all possible slots
    const slots = this.generateTimeSlots(
      businessHours.open_time,
      businessHours.close_time,
      serviceDuration,
    );

    // 7. filter available slots
    const availableSlots = slots.filter((slot) =>
      this.isSlotAvailable(slot, serviceDuration, bookings),
    );

    return availableSlots;
  }

  // -----------------------------
  // SLOT GENERATOR
  // -----------------------------
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

      // stop if slot exceeds business hours
      if (slotEnd > end) break;

      slots.push(slotStart.toTimeString().slice(0, 5));

      start.setMinutes(start.getMinutes() + durationMinutes);
    }

    return slots;
  }

  // -----------------------------
  // AVAILABILITY CHECK
  // -----------------------------
  private isSlotAvailable(
    slot: string,
    serviceDuration: number,
    bookings: {
      start_time: string;
      service: {
        hour: number;
        minute: number;
      };
    }[],
  ) {
    const slotStart = this.toMinutes(slot);
    const slotEnd = slotStart + serviceDuration;

    return !bookings.some((booking) => {
      const bookingStart = this.toMinutes(booking.start_time);

      const bookingDuration =
        booking.service.hour * 60 + booking.service.minute;

      const bookingEnd = bookingStart + bookingDuration;

      // overlap detection
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  // -----------------------------
  // HELPERS
  // -----------------------------
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

  async createBookings(dto: CreateBookingDto, business_id: string) {
    const existingBusiness = await this.businessRepo.findById(business_id);

    if (!existingBusiness) {
      throw new NotFoundError("Business not found");
    }

    const isStaffMember = await this.membershipRepo.findStaffMember(
      dto.staff_id,
      business_id,
    );

    if (!isStaffMember) throw new BadRequestError("Invalid Staff");

    if (!isStaffMember.user.is_active) {
      throw new BadRequestError("Staff is unavailable");
    }

    const isServiceBelongsToBusiness =
      await this.serviceRepo.findByServiceBusinessId(
        dto.service_id,
        business_id,
      );

    if (!isServiceBelongsToBusiness)
      throw new BadRequestError("Service is not exist in the business");

    const bookingDateTime = new Date(dto.booking_date);

    const [hours, minutes] = dto.start_time.split(":").map(Number);

    bookingDateTime.setHours(hours, minutes, 0, 0);

    if (bookingDateTime < new Date()) {
      throw new BadRequestError("Cannot book in the past");
    }

    const availableSlots = await this.getAvailableSlots({
      booking_date: dto.booking_date,
      business_id: business_id,
      service_id: dto.service_id,
      staff_id: dto.staff_id,
    });

    if (!availableSlots.includes(dto.start_time)) {
      throw new BadRequestError("Invalid slot");
    }

    const payload: Prisma.BookingCreateInput = {
      first_name: dto.first_name,
      last_name: dto.last_name,
      email_address: dto.email_address,
      phone_number: dto.phone_number,
      aditional_notes: dto.aditional_notes,
      service_price: isServiceBelongsToBusiness.price,

      payment_method: dto.payment_method,

      booking_date: dto.booking_date,

      start_time: dto.start_time,

      business: {
        connect: { id: business_id },
      },
      service: {
        connect: { id: dto.service_id },
      },
      staff: {
        connect: { id: dto.staff_id },
      },
    };

    try {
      const booking = await this.bookingRepo.create(payload);

      try {
        bookingProducer.bookingSuccess({
          email: dto.email_address,
          firstName: dto.first_name,
          lastName: dto.last_name,
          bookingDate: dto.booking_date,
          startTime: dto.start_time,
          bookingId: booking.id,
          serviceName: isServiceBelongsToBusiness.service_name,
          servicePrice: isServiceBelongsToBusiness.price.toNumber(),
        });
      } catch (err) {
        console.error("RabbitMQ failed, but booking is saved:", err);
      }

      return booking;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError("This slot is no longer available");
      }

      throw error;
    }
  }

  async fetchAllBookings(business_id: string) {
    return await this.bookingRepo.getBookings(business_id);
  }

  async confirmBooking(id: string, user_id: string, business_id: string) {
    const existingBooking = await this.bookingRepo.findById(id);
    if (!existingBooking) throw new NotFoundError("Booking not found");

    if (existingBooking.business_id !== business_id) {
      throw new ForbbidenError("Booking does not belong to this business");
    }

    const isOwner = await this.membershipService.assertOwner(
      user_id,
      business_id,
    );

    const isAssignedStaff = existingBooking.staff_id === user_id;

    if (!isOwner && !isAssignedStaff)
      throw new ForbbidenError("Not allowed to confirm the booking");

    if (existingBooking.status !== BookingStatus.PENDING) {
      throw new BadRequestError(`Booking is already ${existingBooking.status}`);
    }

    const result = await this.bookingRepo.updateBooking(id, {
      status: "CONFIRMED",
    });

    if (result) {
      bookingProducer.bookingConfirm({
        bookingDate: existingBooking.booking_date,
        email: existingBooking.email_address,
        firstName: existingBooking.first_name,
        lastName: existingBooking.last_name,
        startTime: existingBooking.start_time,
      });
    }
    return result;
  }

  async cancelBooking(id: string, user_id: string, business_id: string) {
    const existingBooking = await this.bookingRepo.findById(id);
    if (!existingBooking) throw new NotFoundError("Booking not found");

    if (existingBooking.business_id !== business_id) {
      throw new ForbbidenError("Booking does not belong to this business");
    }

    const isOwner = await this.membershipService.assertOwner(
      user_id,
      business_id,
    );

    const isAssignedStaff = existingBooking.staff_id === user_id;

    if (!isOwner && !isAssignedStaff)
      throw new ForbbidenError("Not allowed to confirm the booking");

    const result = await this.bookingRepo.updateBooking(id, {
      status: "CANCELLED",
    });

    if (result) {
      bookingProducer.bookingCancel({
        bookingDate: existingBooking.booking_date,
        email: existingBooking.email_address,
        firstName: existingBooking.first_name,
        lastName: existingBooking.last_name,
        startTime: existingBooking.start_time,
      });
    }
    return result;
  }
}
