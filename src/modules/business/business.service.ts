import { Prisma } from "@prisma/client";
import slugify from "slugify";

import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

import { BusinessRepository } from "./business.repository";

import { CreateBusinessDTO } from "./validation/business.validation";

export class BusinessService {
  constructor(
    private businessRepo: BusinessRepository,
  ) {}

  async create(
    data: CreateBusinessDTO,
    tx?: Prisma.TransactionClient,
  ) {
    const slug = slugify(data.business_name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingBusiness =
      await this.businessRepo.findBySlug(
        slug,
        tx,
      );

    if (existingBusiness) {
      throw new ConflictError(
        "Business slug already exists",
      );
    }

    const payload: Prisma.BusinessCreateInput = {
      business_name: data.business_name,
      slug,
      category: data.category,

      ...(data.description && {
        description: data.description,
      }),

      ...(data.email && {
        email: data.email,
      }),

      ...(data.phone && {
        phone: data.phone,
      }),

      ...(data.address && {
        address: data.address,
      }),

      ...(data.logo && {
        logo: data.logo,
      }),
    };

    return await this.businessRepo.create(
      payload,
      tx,
    );
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const business =
      await this.businessRepo.findById(id, tx);

    if (!business) {
      throw new NotFoundError(
        "Business not found",
      );
    }

    return business;
  }

  async findBySlug(
    slug: string,
    tx?: Prisma.TransactionClient,
  ) {
    const business =
      await this.businessRepo.findBySlug(
        slug,
        tx,
      );

    if (!business) {
      throw new NotFoundError(
        "Business not found",
      );
    }

    return business;
  }
}