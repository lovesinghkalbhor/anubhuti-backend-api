import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userExtensions = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      user: {
        async isPasswordCorrect(
          userId: number,
          password: string
        ): Promise<boolean> {
          const user = await client.user.findUnique({
            where: { id: userId },
          });

          if (!user || !user.password)
            throw new Error("User not found or password not set");
          return bcrypt.compare(password, user.password);
        },

        async generateAccessToken(userId: any): Promise<string> {
          const user = await client.user.findUnique({
            where: { id: userId },
          });
          if (!user) throw new Error("User not found");

          return jwt.sign(
            {
              id: user.id,
              email: user.email,
              name: user.name,
              mobile: user.mobile,
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: process.env.ACCESS_TOKEN_EXP }
          );
        },

        async generateRefreshToken(userId: any): Promise<string> {
          const user = await client.user.findUnique({
            where: { id: userId },
          });

          if (!user) throw new Error("User not found");

          return jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: process.env.REFRESH_TOKEN_EXP }
          );
        },
      },
    },
  });
});

export default userExtensions;
