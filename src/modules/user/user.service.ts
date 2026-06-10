import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import * as fs from "fs/promises";
import { UserRepository } from "./user.repository";

import {
  CreateOAuthUserDTO,
  CreateUserDTO,
  UpdateUserDTO,
} from "./validation/user.validation";
import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async create(data: CreateUserDTO, tx?: Prisma.TransactionClient) {
    const existingUser = await this.userRepo.findByEmail(data.email, tx);

    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    if (data.phone) {
      await this.findByPhone(data.phone);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const payload: Prisma.UserCreateInput = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: hashedPassword,
      ...(data.phone && {
        phone: data.phone,
      }),
      ...(data.avatar && {
        avatar: data.avatar,
      }),
    };

    return await this.userRepo.create(payload, tx);
  }

  async update(
    id: string,
    dto: UpdateUserDTO,
    avatar?: Express.Multer.File,
    tx?: Prisma.TransactionClient,
  ) {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findByEmail(dto.email);

      if (existing) {
        throw new ConflictError("Email already exists");
      }
    }

    const data: Prisma.UserUpdateInput = {
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      phone: dto.phone
    };

    let oldAvatar: string | null = null;

    if (avatar) {
      data.avatar = avatar.path;
      oldAvatar = user.avatar;
    }

    const updatedUser = await this.userRepo.update(id, data, tx);

    if (oldAvatar) {
      try {
        await fs.unlink(oldAvatar);
      } catch (error) {
        console.error("Failed to delete old avatar", error);
      }
    }
    const { password, ...safe } = updatedUser;
    return safe;
  }

  async createOAuthUser(
    data: CreateOAuthUserDTO,
    tx?: Prisma.TransactionClient,
  ) {
    const existingUser = await this.userRepo.findByEmail(data.email, tx);

    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    if (data.phone) {
      await this.findByPhone(data.phone);
    }

    const payload: Prisma.UserCreateInput = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      ...(data.phone && {
        phone: data.phone,
      }),
      ...(data.avatar && {
        avatar: data.avatar,
      }),
    };

    return await this.userRepo.create(payload, tx);
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    return await this.userRepo.findByEmail(email, tx);
  }

  async findByPhone(phone?: string, tx?: Prisma.TransactionClient) {
    const existingPhone = await this.userRepo.findByPhone(phone, tx);

    if (existingPhone) throw new ConflictError("Phone already exists");

    return existingPhone;
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const exisitngUser = await this.userRepo.findById(id, tx);

    if (!exisitngUser) {
      throw new NotFoundError("User not found");
    }

    const { password, ...safeUser } = exisitngUser;

    return safeUser;
  }
}
