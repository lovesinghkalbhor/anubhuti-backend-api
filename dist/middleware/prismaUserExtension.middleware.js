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
                async isPasswordCorrect(userId, password) {
                    const user = await client.user.findUnique({
                        where: { id: userId },
                    });
                    console.log(password, user?.password);
                    if (!user || !user.password)
                        throw new Error("User not found or password not set");
                    return bcrypt_1.default.compare(password, user.password);
                },
                async generateAccessToken(userId) {
                    const user = await client.user.findUnique({
                        where: { id: userId },
                    });
                    if (!user)
                        throw new Error("User not found");
                    return jsonwebtoken_1.default.sign({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        mobile: user.mobile,
                    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP });
                },
                async generateRefreshToken(userId) {
                    const user = await client.user.findUnique({
                        where: { id: userId },
                    });
                    if (!user)
                        throw new Error("User not found");
                    return jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP });
                },
            },
        },
    });
});
exports.default = exports.userExtensions;
//# sourceMappingURL=prismaUserExtension.middleware.js.map