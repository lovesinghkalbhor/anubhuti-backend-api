import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ApiResponse } from "./ApiResponse";

class ApiErrors extends Error {
  statusCode: number;
  data: any | null;
  success: boolean;
  errors: any[];

  constructor(
    statusCode: number,
    message = "something went wrong",
    errors = [],
    stack = ""
  ) {
    console.log(
      "in this lvoegggggggggggggg \n llllllllllllllllllllll\n33333333333333333333333333\n333333333333333333333333333333\n33333333333333333"
    );
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error caught by middleware:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res
          .status(409)
          .json(new ApiResponse(409, {}, "Some Enter field already exists"));
      case "P2025":
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Resource not found"));
      case "P2003":
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Foreign key constraint failed"));
      case "P2014":
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "A relation constraint check failed"));
      case "P2016":
        return res.status(400).json(new ApiResponse(400, {}, "Input error"));
      case "P2019":
        return res.status(400).json(new ApiResponse(400, {}, "Input error"));
      default:
        console.error("Unhandled Prisma error:", err);
        return res
          .status(500)
          .json(new ApiResponse(500, {}, "A database error occurred"));
    }
  } else if (err instanceof SyntaxError && err.message.includes("JSON")) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid JSON payload"));
  } else {
    console.error("Non-Prisma error:", err);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Internal server error,Contact Developer Support"
        )
      );
  }
};
export { ApiErrors, errorHandler };
