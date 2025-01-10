"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
userRouter.route("/login").post(user_controllers_1.loginUser);
userRouter.route("/register").post(user_controllers_1.registerUser);
userRouter.route("/logout").post(auth_middleware_1.verifyJWT, user_controllers_1.logoutUser);
//# sourceMappingURL=user.routes.js.map