import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

import { UserRepository } from "./user.repository";

import { CreateUserDTO } from "./validation/user.validation";
import { ConflictError } from "../../shared/errors/ConflictError";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async create(data: CreateUserDTO, tx?: Prisma.TransactionClient) {
    const existingUser = await this.userRepo.findByEmail(
      data.email,
      tx,
    );

    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10,
    );

    const payload: Prisma.UserCreateInput = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: hashedPassword,
      ...(data.phone && {
        phone: data.phone,
      }),
    };

    return await this.userRepo.create(payload, tx);
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    return await this.userRepo.findByEmail(email, tx);
  }
}