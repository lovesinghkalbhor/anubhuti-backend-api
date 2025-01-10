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
userRouter.route("/user").get(verifyJWT, getUser);
userRouter.route("/refreshToken").get(verifyRefressJWT, authoriseRefreshToken);
userRouter.route("/isValid").get(verifyJWT, (req, res) => {
  console.log(
    " here is in the valid function\n llllllllllllllllllllll\n33333333333333333333333333\n333333333333333333333333333333\n33333333333333333"
  );
  res.status(200).json(new ApiResponse(200, {}, "Token is valid"));
});

export { userRouter };
