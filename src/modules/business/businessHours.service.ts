import { BusinessHoursRepository } from "./businessHours.repository";
import { CreateBusinessHoursDTO } from "./validation/business.validation";

export class BusinessHoursService {
  constructor(private businessHoursRepo: BusinessHoursRepository) {}

  async create(dto: CreateBusinessHoursDTO, businessId: string) {
    return await Promise.all(
      dto.schedules.map((item) =>
        this.businessHoursRepo.upsert(businessId, item),
      ),
    );
  }

  async getBusinessHours(business_id: string) {
    return await this.businessHoursRepo.findMany(business_id);
  }
}
