import { NextFunction, Response } from "express";
import { AuthRequest } from "../../shared/middleware/authMiddleware";
import { DashboardService } from "./dashboard.service";

export class DashbboardController {
  constructor(private dashboardService: DashboardService) {}

  dashboard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.headers["x-business-id"] as string;

      if (!business_id) {
        res.status(400).json({ message: "Business ID is required" });
        return;
      }

      const result = await this.dashboardService.dashboard(business_id);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  staffDashboard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const business_id = req.headers["x-business-id"] as string;
      const user_id = req.user?.userId!

      if (!business_id) {
        res.status(400).json({ message: "Business ID is required" });
        return;
      }

      const result = await this.dashboardService.staffDashboard(business_id, user_id);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
