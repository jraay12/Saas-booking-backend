import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ServiceRepository } from "./service.repository";
import { Prisma } from "@prisma/client";
import {
  AssignStaffDTO,
  CreateServiceDTO,
  UpdateServiceDTO,
} from "./validation/service.validation";
import fs from "fs";
import path from "path";
import { ConflictError } from "../../shared/errors/ConflictError";
import { MembershipService } from "../membership/membership.service";
import { BadRequestError } from "../../shared/errors/BadRequestError";
export class ServiceService {
  constructor(
    private serviceRepo: ServiceRepository,
    private membershipService: MembershipService,
  ) {}

  async create(
    data: CreateServiceDTO,
    businessId: string,
    staffIds?: string[],
  ) {
    if (staffIds && staffIds.length > 0) {
      const members = await this.membershipService.findMembersByIds(
        staffIds,
        businessId,
      );

      if (members.length > 0) {
        throw new BadRequestError(`Some users are not staff members of the business`);
      }
    }

    const payload: Prisma.ServiceCreateInput = {
      service_name: data.service_name,
      category: data.category,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      hour: data.hour,
      minute: data.minute,
      image_path: data.image_path,
      business: {
        connect: {
          id: data.business_id,
        },
      },
    };

    return await this.serviceRepo.create(payload, businessId, staffIds);
  }

  async findAll(businessId: string) {
    return await this.serviceRepo.findAll(businessId);
  }

  async findById(id: string) {
    const service = await this.serviceRepo.findById(id);

    if (!service) {
      throw new NotFoundError("Service not found");
    }

    return service;
  }

  async update(id: string, data: UpdateServiceDTO & { image_path?: string }) {
    const existingService = await this.findById(id);

    const uploadDir = path.join(process.cwd(), "public", "services");
    // delete old image if new one is provided
    if (data.image_path && existingService?.image_path) {
      const filename = path.basename(existingService.image_path);

      const oldImagePath = path.join(uploadDir, filename);

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const payload: Prisma.ServiceUpdateInput = {
      ...(data.service_name && {
        service_name: data.service_name,
      }),

      ...(data.category && {
        category: data.category,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.price !== undefined && {
        price: new Prisma.Decimal(data.price),
      }),

      ...(data.hour !== undefined && {
        hour: data.hour,
      }),

      ...(data.minute !== undefined && {
        minute: data.minute,
      }),

      // image update
      ...(data.image_path && {
        image_path: data.image_path,
      }),
    };

    return await this.serviceRepo.update(id, payload);
  }

  async delete(id: string) {
    await this.findById(id);

    return await this.serviceRepo.delete(id);
  }

  async assignStaffToService(data: AssignStaffDTO) {
    await this.findById(data.service_id);

    await this.membershipService.assertStaffMember(
      data.staff_id,
      data.business_id!,
    );

    const existing = await this.serviceRepo.findByServiceAndStaff(
      data.service_id,
      data.staff_id,
    );

    if (existing) {
      throw new ConflictError("Staff already assigned to this service");
    }

    return await this.serviceRepo.assign({
      business_id: data.business_id!,
      service: {
        connect: { id: data.service_id },
      },
      staff: {
        connect: { id: data.staff_id },
      },
    });
  }

  // TO BE IMPROVED THE LOGIC
  async removeStaffFromService(data: AssignStaffDTO, business_id: string) {
    return await this.serviceRepo.remove(
      data.service_id,
      data.staff_id,
      business_id,
    );
  }

  async toggleStatus(id: string, businessId: string, user_id: string) {
    await this.membershipService.assertOwner(user_id, businessId);

    return this.serviceRepo.toggleStatus(id, businessId);
  }
}
