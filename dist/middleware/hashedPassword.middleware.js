"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const passwordHashingMiddleware = async (params, next) => {
    // Check if the query is related to the 'User' model
    if (params.model === "User") {
        // For create operations
        if (params.action === "create") {
            if (params.args.data.password) {
                const salt = await bcrypt_1.default.genSalt(10);
                params.args.data.password = await bcrypt_1.default.hash(params.args.data.password, salt);
            }
        }
        // For update operations
        if (params.action === "update") {
            if (params.args.data.password) {
                const salt = await bcrypt_1.default.genSalt(10);
                params.args.data.password = await bcrypt_1.default.hash(params.args.data.password, salt);
            }
        }
    }
    // Pass control to the next middleware or Prisma action
    return next(params);
};
exports.default = passwordHashingMiddleware;
//# sourceMappingURL=hashedPassword.middleware.js.map