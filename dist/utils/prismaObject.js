"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const hashedPassword_middleware_1 = __importDefault(require("../middleware/hashedPassword.middleware"));
const prismaUserExtension_middleware_1 = __importDefault(require("../middleware/prismaUserExtension.middleware"));
const prisma = new client_1.PrismaClient();
// Apply middleware first
prisma.$use(hashedPassword_middleware_1.default);
// Then extend the client
const extendedPrisma = prisma.$extends(prismaUserExtension_middleware_1.default);
exports.default = extendedPrisma;
//# sourceMappingURL=prismaObject.js.map