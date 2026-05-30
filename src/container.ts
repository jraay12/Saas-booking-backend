import { BusinessController } from './modules/business/business.controller';
import { ServiceController } from "./modules/services/service.controller";
import { ServiceRepository } from "./modules/services/service.repository";
import { ServiceService } from "./modules/services/service.service";
import { UserService } from "./modules/user/user.service";
import { UserController } from "./modules/user/user.controller";
import { UserRepository } from "./modules/user/user.repository";
import { MembershipRepository } from "./modules/membership/membership.repository";
import { MembershipService } from "./modules/membership/membership.service";
import { BusinessRepository } from "./modules/business/business.repository";
import { BusinessService } from "./modules/business/business.service";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";
import { StaffService } from "./modules/staff/staff.service";
import StaffController from "./modules/staff/staff.controller";
import { MembershipController } from "./modules/membership/membership.controller";
import { BusinessHoursController } from "./modules/business/businessHours.controller";
import { BusinessHoursRepository } from "./modules/business/businessHours.repository";
import { BusinessHoursService } from "./modules/business/businessHours.service";
import { BookingRepository } from "./modules/booking/booking.repository";
import { BookingService } from "./modules/booking/booking.service";
import { BookingController } from "./modules/booking/booking.controller";

import { prisma } from "./lib/prisma";

// repository
const serviceRepo = new ServiceRepository(prisma)
const userRepository = new UserRepository(prisma)
const membershipRepository = new MembershipRepository(prisma)
const businessRepository = new BusinessRepository(prisma)
const businessHoursRepository = new BusinessHoursRepository(prisma)
const bookingRepository = new BookingRepository(prisma)
// service

const userService = new UserService(userRepository)
const  membershipService = new MembershipService(membershipRepository, serviceRepo, prisma)
const businessService = new BusinessService(businessRepository)
const authService = new AuthService(prisma, userService, businessService, membershipService, userRepository)
const staffService = new StaffService(userService, membershipService, prisma)
const serviceService = new ServiceService(serviceRepo, membershipService, membershipRepository)
const businessHoursService = new BusinessHoursService(businessHoursRepository)
const bookingService = new BookingService(businessHoursRepository, bookingRepository, serviceRepo, membershipRepository, businessRepository)
// controller 

export const serviceController = new ServiceController(serviceService)
export const userController = new UserController(userService)
export const authController = new AuthController(authService)
export const staffController = new StaffController(staffService)
export const membershipController = new MembershipController(membershipService)
export const businessHoursController = new BusinessHoursController(businessHoursService)
export const bookingController = new BookingController(bookingService)
export const businessController = new BusinessController(businessService)