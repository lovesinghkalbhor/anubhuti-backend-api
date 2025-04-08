"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefressJWT = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
const ApiResponse_1 = require("../utils/ApiResponse");
const verifyJWT = async (req, res, next) => {
    try {
        // Get ACCESS token from cookies or Authorization header
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        // Check if token is missing
        if (!token) {
            res.status(400).json(new ApiResponse_1.ApiResponse(401, {
                tokenExpired: false,
            }, "Unauthorized request: Invalid Token or expired. Please login again."));
            return;
        }
        // Verify the JWT token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Check if the token is invalid
        if (!decodedToken) {
            res.status(400).json(new ApiResponse_1.ApiResponse(401, {
                tokenExpired: false,
            }, "Unauthorized request: Invalid Token or expired. Please login again."));
            return;
        }
        // Find user by ID from the decoded token
        const user = await prismaObject_1.default.user.findUnique({
            where: { id: Number(decodedToken.id) },
        });
        // If user is not found, throw an error
        if (!user) {
            res.status(400).json(new ApiResponse_1.ApiResponse(401, {
                tokenExpired: false,
            }, "Unauthorized request: Invalid Token or expired. Please login again."));
            return;
        }
        // Attach user to the request object (add custom property)
        req.user = user;
        // Proceed to the next middleware
        next();
    }
    catch (error) {
        next(error);
    }
    // Pass the error to the next middleware for centralized error handling
};
exports.verifyJWT = verifyJWT;
/////////////////////////////////////////////////////////////////
const verifyRefressJWT = async (req, res, next) => {
    try {
        // Get ACCESS token from cookies or Authorization header
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        // Check if token is missing
        if (!token) {
            res.status(400).json(new ApiResponse_1.ApiResponse(401, {
                tokenExpired: false,
            }, "Unauthorized request: Invalid Token or expired. Please login again."));
            return;
        }
        // Verify the JWT token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        // Check if the token is invalid
        if (!decodedToken) {
            res.status(400).json(new ApiResponse_1.ApiResponse(401, {
                tokenExpired: false,
            }, "Unauthorized request: Invalid Token or expired. Please login again."));
            return;
        }
        // Find user by ID from the decoded token
        const user = await prismaObject_1.default.user.findUnique({
            where: { id: Number(decodedToken.id) },
        });
        // If user is not found, throw an error
        if (!user) {
            res.status(400).json(new ApiResponse_1.ApiResponse(401, {
                tokenExpired: false,
            }, "Unauthorized request: Invalid Token or expired. Please login again."));
            return;
        }
        // Attach user to the request object (add custom property)
        req.user = user;
        // Proceed to the next middleware
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyRefressJWT = verifyRefressJWT;
//# sourceMappingURL=auth.middleware.js.map