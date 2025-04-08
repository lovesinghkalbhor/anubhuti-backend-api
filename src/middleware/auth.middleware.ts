import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import { ApiErrors } from "../utils/ApiErrors";
import prisma from "../utils/prismaObject";
import { ApiResponse } from "../utils/ApiResponse";
import { JwtPayload } from "../types/types";

const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get ACCESS token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if token is missing
    if (!token) {
      res.status(400).json(
        new ApiResponse(
          401,
          {
            tokenExpired: false,
          },
          "Unauthorized request: Invalid Token or expired. Please login again."
        )
      );
      return;
    }

    // Verify the JWT token
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    // Check if the token is invalid
    if (!decodedToken) {
      res.status(400).json(
        new ApiResponse(
          401,
          {
            tokenExpired: false,
          },
          "Unauthorized request: Invalid Token or expired. Please login again."
        )
      );
      return;
    }

    // Find user by ID from the decoded token
    const user = await prisma.user.findUnique({
      where: { id: Number(decodedToken.id) },
    });

    // If user is not found, throw an error
    if (!user) {
      res.status(400).json(
        new ApiResponse(
          401,
          {
            tokenExpired: false,
          },
          "Unauthorized request: Invalid Token or expired. Please login again."
        )
      );
      return;
    }

    // Attach user to the request object (add custom property)
    (req as Request & { user?: User }).user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    next(error);
  }
  // Pass the error to the next middleware for centralized error handling
};

/////////////////////////////////////////////////////////////////
const verifyRefressJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get ACCESS token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if token is missing
    if (!token) {
      res.status(400).json(
        new ApiResponse(
          401,
          {
            tokenExpired: false,
          },
          "Unauthorized request: Invalid Token or expired. Please login again."
        )
      );
      return;
    }

    // Verify the JWT token
    const decodedToken = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;

    // Check if the token is invalid
    if (!decodedToken) {
      res.status(400).json(
        new ApiResponse(
          401,
          {
            tokenExpired: false,
          },
          "Unauthorized request: Invalid Token or expired. Please login again."
        )
      );
      return;
    }

    // Find user by ID from the decoded token

    const user = await prisma.user.findUnique({
      where: { id: Number(decodedToken.id) },
    });

    // If user is not found, throw an error
    if (!user) {
      res.status(400).json(
        new ApiResponse(
          401,
          {
            tokenExpired: false,
          },
          "Unauthorized request: Invalid Token or expired. Please login again."
        )
      );
      return;
    }

    // Attach user to the request object (add custom property)
    (req as Request & { user?: User }).user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    next(error);
  }
};

export { verifyJWT, verifyRefressJWT };
