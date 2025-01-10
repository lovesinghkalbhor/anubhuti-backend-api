"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiErrors_1 = require("../utils/ApiErrors");
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
require("../types/express");
const verifyJWT = async (req, _, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        // Check if token is missing
        if (!token) {
            return next(new ApiErrors_1.ApiErrors(401, "Unauthorized request: Token not found. Please login."));
        }
        // Verify the JWT token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Check if the token is invalid
        if (!decodedToken) {
            return next(new ApiErrors_1.ApiErrors(401, "Invalid Access Token"));
        }
        // Find user by ID from the decoded token
        const user = await prismaObject_1.default.user.findUnique({
            where: { id: Number(decodedToken._id) },
        });
        // If user is not found, throw an error
        if (!user) {
            return next(new ApiErrors_1.ApiErrors(401, "Invalid Access Token: User not found"));
        }
        // Attach user to the request object (add custom property)
        req.user = user; // This will no longer cause a TypeScript error
        // Proceed to the next middleware
        next();
    }
    catch (error) {
        // Pass the error to the next middleware for centralized error handling
        next(new ApiErrors_1.ApiErrors(401, "Invalid access token"));
    }
};
exports.verifyJWT = verifyJWT;
//# sourceMappingURL=auth.middleware.js.map