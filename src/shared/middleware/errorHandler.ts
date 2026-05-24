import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import { ZodError } from "zod";
import { UnAuthorized } from "../errors/UnAuthorized";
import { ForbbidenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof BadRequestError) {
    return res.status(400).json({
      error: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: err.message,
    });
  }

  if (err instanceof UnAuthorized) {
    return res.status(401).json({
      error: err.message,
    });
  }

  // if (err instanceof ConflictError){
  //   return res.status(409).json({
  //     error: err.message
  //   })
  // }

  if (err instanceof ForbbidenError){
    return res.status(403).json({
      error: err.message
    })
  }

  if ((err as any).code === "P2002") {
    res
      .status(409)
      .json({ success: false, message: "Unique constraint failed" });
    return;
  }

  if(err instanceof ZodError){
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues
    });
  }

  console.log(err);
  res.status(500).json({ success: false, message: "Internal server error" });
};
