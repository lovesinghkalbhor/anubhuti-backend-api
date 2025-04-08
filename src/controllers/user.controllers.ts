import { asyncHandler } from "../utils/asyncHandler";
import { ApiErrors } from "../utils/ApiErrors";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "@prisma/client";
import prisma from "../utils/prismaObject";
import { returnUserdata } from "../types/types";
async function generteAccessAndRefreshToken(user: User) {
  try {
    const [refreshToken, accessToken] = await Promise.all([
      prisma.user.generateRefreshToken(user),
      prisma.user.generateAccessToken(user),
    ]);

    const updateRefreshToken = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    if (!updateRefreshToken) {
      throw new ApiErrors(500, "try login again");
    }
    // await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiErrors(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
}

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, adhar_card, mobile, email, password } = req.body;

  if (!name || !adhar_card || !mobile || !password) {
    return res
      .status(400) // Bad Request
      .json(new ApiResponse(400, "", "Missing required fields"));
  }

  const existinguser = await prisma.user.findFirst({
    where: { OR: [{ mobile: mobile }, { adhar_card: adhar_card }] },
    select: { id: true }, // Only fetch what we need
  });

  if (existinguser) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "User already exists"));
  }

  const user: User = await prisma.user.create({
    data: {
      name,
      adhar_card,
      mobile,
      email,
      password,
    },
  });

  if (!user) {
    return res
      .status(500)
      .json(new ApiResponse(500, "", "someting went wrong please try again"));
  }

  const { refreshToken, accessToken } = await generteAccessAndRefreshToken(
    user
  );

  const returnUser: returnUserdata = {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    adhar_card: user.adhar_card,
    refreshToken: refreshToken,
    accessToken,
  };

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(201, returnUser, "User registered successfully"));
});

///////////////////////////////////////////////////

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Mobile and password are required"));
  }

  const user = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  const isPasswordCorrect = await prisma.user.isPasswordCorrect(
    user.password,
    password
  );

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invalid credentials"));
  }

  const { refreshToken, accessToken } = await generteAccessAndRefreshToken(
    user
  );

  const returnUser: returnUserdata = {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    adhar_card: user.adhar_card,
    refreshToken: refreshToken,
    accessToken,
  };

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, returnUser, "login successfully"));
});

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// LOGOUT USER
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: any }).user.id;

  // Clear tokens from the database
  const user = await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  if (!user) {
    return res
      .status(500) // Internal Server Error
      .json(new ApiResponse(500, "", "Something went wrong, Please try again"));
  }

  // Clear tokens from cookies

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "Logout successful"));
});

///////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////

const authoriseRefreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as Request & { user: any }).user;

    const { refreshToken, accessToken } = await generteAccessAndRefreshToken(
      user
    );

    if (!refreshToken || !accessToken) {
      throw new ApiErrors(
        500,

        "Failed to generate new tokens. Please try again."
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            refreshToken,
            accessToken,
          },
          "login successfully"
        )
      );
  }
);
//////////////////////////////////////////
///////////////////////// ////////////////////////
///////////////////////////////////////////////////

// CHANGE PASSWORD
const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Old and new passwords are required"));
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Old password is incorrect"));
  }

  // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: newPassword },
    select: { id: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});
//////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

// UPDATE USER
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;
  const { name, mobile, email, adhar_card } = req.body;
  if (!name || !mobile || !email || !adhar_card) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required"));
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name, mobile, email, adhar_card },
    select: {
      email: true,
      name: true,
      mobile: true,
      adhar_card: true,
    },
  });

  // if (!updatedUser) {
  //   return res
  //     .status(500) // Internal Server Error
  //     .json(new ApiResponse(500, "", "Something went wrong, User not updated"));
  // }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser || "",
        updatedUser
          ? "User updated successfully"
          : "Something went wrong, User not updated"
      )
    );
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

// GET USER
const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;

  const responseuser = {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    adhar_card: user.adhar_card,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseuser, "User fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  authoriseRefreshToken,
  changePassword,
  updateUser,
  getUser,
};
