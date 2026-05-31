import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

import { UserRepository } from "./user.repository";

import { CreateUserDTO } from "./validation/user.validation";
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
