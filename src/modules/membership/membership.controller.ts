import { AuthRequest } from "../../shared/middleware/authMiddleware";
import { MembershipService } from "./membership.service";
import { Request, Response, NextFunction } from "express";

export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  findAllMembers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.user?.businessId;

      const result = await this.membershipService.findAllMembers(business_id!);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  removeStaff = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.user?.businessId;
      const {user_id} = req.params as {user_id: string}
      const result = await this.membershipService.removeStaff(user_id, business_id!);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
