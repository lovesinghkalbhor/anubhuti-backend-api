import { PrismaClient } from "@prisma/client";
import passwordHashingMiddleware from "../middleware/hashedPassword.middleware";
import userExtensions from "../middleware/prismaUserExtension.middleware";
const prisma = new PrismaClient();

// Apply middleware first
prisma.$use(passwordHashingMiddleware);

// Then extend the client
const extendedPrisma = prisma.$extends(userExtensions);
export default extendedPrisma;
