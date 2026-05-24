import { ServiceController } from "./modules/services/service.controller";
import { ServiceRepository } from "./modules/services/service.repository";
import { ServiceService } from "./modules/services/service.service";
import { prisma } from "./lib/prisma";

// repository
const serviceRepo = new ServiceRepository(prisma)


// service
const serviceService = new ServiceService(serviceRepo)


// controller 

export const serviceController = new ServiceController(serviceService)