import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

const passwordHashingMiddleware: Prisma.Middleware = async (params, next) => {
  // Check if the query is related to the 'User' model
  if (params.model === "User") {
    // For create operations
    if (params.action === "create") {
      if (params.args.data.password) {
        const salt = await bcrypt.genSalt(10);
        params.args.data.password = await bcrypt.hash(
          params.args.data.password,
          salt
        );
      }
    }

    // For update operations
    if (params.action === "update") {
      if (params.args.data.password) {
        const salt = await bcrypt.genSalt(10);
        params.args.data.password = await bcrypt.hash(
          params.args.data.password,
          salt
        );
      }
    }
  }

  // Pass control to the next middleware or Prisma action
  return next(params);
};

export default passwordHashingMiddleware;
