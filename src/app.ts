import express, { Request, Response } from "express";
import { json } from "node:stream/consumers";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Express + TypeScript is running 🚀");
});


export default app;
