import express, { Request, Response } from "express";
import { errorHandler } from "./shared/middleware/errorHandler";
import serviceRoutes from "./modules/services/service.route";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import membershipRoutes from "./modules/membership/membership.routes";
import {
  serviceController,
  userController,
  authController,
  staffController,
  membershipController,
  businessHoursController,
  bookingController,
  businessController,
  dashboardController
} from "./container";
import staffRoutes from "./modules/staff/staff.routes";
import businessHoursRoutes from "./modules/business/businessHours.routes";
import bookingRoutes from "./modules/booking/booking.routes";
import businessRoutes from "./modules/business/business.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.route";
import path from "node:path";
import cors, { CorsOptions } from "cors";
const app = express();

const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "https://jraay12.github.io"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/api/v1/service", serviceRoutes(serviceController));
app.use("/api/v1/user", userRoutes(userController));
app.use("/api/v1/auth", authRoutes(authController));
app.use("/api/v1/staff", staffRoutes(staffController));
app.use("/api/v1/membership", membershipRoutes(membershipController));
app.use("/api/v1/business-hours", businessHoursRoutes(businessHoursController));
app.use("/api/v1/booking", bookingRoutes(bookingController));
app.use("/api/v1/business", businessRoutes(businessController));
app.use("/api/v1/dashboard", dashboardRoutes(dashboardController));



app.use(errorHandler);

app.get("/health", (req, res) => {
  res.send("Express + TypeScript is running 🚀");
});

export default app;
