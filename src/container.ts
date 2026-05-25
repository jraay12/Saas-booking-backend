import { ServiceController } from "./modules/services/service.controller";
import { ServiceRepository } from "./modules/services/service.repository";
import { ServiceService } from "./modules/services/service.service";
import { UserService } from "./modules/user/user.service";
import { UserController } from "./modules/user/user.controller";
import { UserRepository } from "./modules/user/user.repository";
import { prisma } from "./lib/prisma";

// repository
const serviceRepo = new ServiceRepository(prisma)
const userRepository = new UserRepository(prisma)


// service
const serviceService = new ServiceService(serviceRepo)
const userService = new UserService(userRepository)

// controller 

export const serviceController = new ServiceController(serviceService)
export const userController = new UserController(userService)