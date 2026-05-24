import express, { Request, Response } from "express";
import { errorHandler } from "./shared/middleware/errorHandler";
import serviceRoutes from "./modules/services/service.route";
import { serviceController } from "./container";
const app = express();

app.use(express.json());
app.use("/api/v1/service", serviceRoutes(serviceController));

app.use(errorHandler)

app.get("/health", (req, res) => {
  res.send("Express + TypeScript is running 🚀");
});


export default app;
