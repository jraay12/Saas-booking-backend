import express, { Request, Response } from "express";
import { errorHandler } from "./shared/middleware/errorHandler";
import serviceRoutes from "./modules/services/service.route";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { serviceController, userController, authController } from "./container";
import path from "node:path";
const app = express();

app.use(express.json());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/api/v1/service", serviceRoutes(serviceController));
app.use("/api/v1/user", userRoutes(userController));
app.use("/api/v1/auth", authRoutes(authController));

app.use(errorHandler);

app.get("/health", (req, res) => {
  res.send("Express + TypeScript is running 🚀");
});

export default app;
