import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  updateUser,
  getUser,
  authoriseRefreshToken,
  // getDonationList,
  // addDonation,
} from "../controllers/user.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyJWT, verifyRefressJWT } from "../middleware/auth.middleware";
const userRouter = Router();

userRouter.route("/login").post(loginUser);

userRouter.route("/register").post(registerUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/changePassword").put(verifyJWT, changePassword);
userRouter.route("/updateUser").put(verifyJWT, updateUser);
userRouter.route("/userById").get(verifyJWT, getUser);
userRouter.route("/refreshToken").get(verifyRefressJWT, authoriseRefreshToken);
userRouter.route("/isValid").get(verifyJWT, (req, res) => {
  res.status(200).json(new ApiResponse(200, {}, "Token is valid"));
});

export { userRouter };
