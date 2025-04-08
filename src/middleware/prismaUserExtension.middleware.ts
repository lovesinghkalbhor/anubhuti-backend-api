import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

export const userExtensions = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      user: {
        async isPasswordCorrect(
          DBpassword: string,
          Userpassword: string
        ): Promise<boolean> {
          return bcrypt.compare(Userpassword, DBpassword);
        },

        async generateAccessToken(user: any): Promise<string> {
          const accessTokenOptions: SignOptions = {
            expiresIn: Number(process.env.ACCESS_TOKEN_EXP) || 1000 * 60 * 60,
          };

          return jwt.sign(
            {
              id: user?.id,
              email: user?.email,
              name: user?.name,
              mobile: user?.mobile,
            },
            process.env.ACCESS_TOKEN_SECRET ?? "",
            accessTokenOptions
          );
        },

        async generateRefreshToken(user: any): Promise<string> {
          const refreshTokenOptions: SignOptions = {
            expiresIn:
              Number(process.env.REFRESH_TOKEN_EXP) || 1000 * 60 * 60 * 12,
          };

          return jwt.sign(
            { id: user?.id },
            process.env.REFRESH_TOKEN_SECRET ?? "",
            refreshTokenOptions
          );
        },
      },
    },
  });
});

export default userExtensions;
