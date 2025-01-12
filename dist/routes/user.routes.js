"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const ApiResponse_1 = require("../utils/ApiResponse");
const auth_middleware_1 = require("../middleware/auth.middleware");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
userRouter.route("/login").post(user_controllers_1.loginUser);
userRouter.route("/register").post(user_controllers_1.registerUser);
userRouter.route("/logout").post(auth_middleware_1.verifyJWT, user_controllers_1.logoutUser);
userRouter.route("/changePassword").put(auth_middleware_1.verifyJWT, user_controllers_1.changePassword);
userRouter.route("/updateUser").put(auth_middleware_1.verifyJWT, user_controllers_1.updateUser);
userRouter.route("/userById").get(auth_middleware_1.verifyJWT, user_controllers_1.getUser);
userRouter.route("/refreshToken").get(auth_middleware_1.verifyRefressJWT, user_controllers_1.authoriseRefreshToken);
userRouter.route("/isValid").get(auth_middleware_1.verifyJWT, (req, res) => {
    res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Token is valid"));
});
//# sourceMappingURL=user.routes.js.map