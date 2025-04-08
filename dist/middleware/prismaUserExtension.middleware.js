"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExtensions = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userExtensions = client_1.Prisma.defineExtension((client) => {
    return client.$extends({
        model: {
            user: {
                async isPasswordCorrect(DBpassword, Userpassword) {
                    return bcrypt_1.default.compare(Userpassword, DBpassword);
                },
                async generateAccessToken(user) {
                    const accessTokenOptions = {
                        expiresIn: Number(process.env.ACCESS_TOKEN_EXP) || 1000 * 60 * 60,
                    };
                    return jsonwebtoken_1.default.sign({
                        id: user?.id,
                        email: user?.email,
                        name: user?.name,
                        mobile: user?.mobile,
                    }, process.env.ACCESS_TOKEN_SECRET ?? "", accessTokenOptions);
                },
                async generateRefreshToken(user) {
                    const refreshTokenOptions = {
                        expiresIn: Number(process.env.REFRESH_TOKEN_EXP) || 1000 * 60 * 60 * 12,
                    };
                    return jsonwebtoken_1.default.sign({ id: user?.id }, process.env.REFRESH_TOKEN_SECRET ?? "", refreshTokenOptions);
                },
            },
        },
    });
});
exports.default = exports.userExtensions;
//# sourceMappingURL=prismaUserExtension.middleware.js.map