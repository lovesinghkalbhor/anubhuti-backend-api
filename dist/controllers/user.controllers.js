"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.updateUser = exports.changePassword = exports.authoriseRefreshToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiErrors_1 = require("../utils/ApiErrors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ApiResponse_1 = require("../utils/ApiResponse");
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
async function generteAccessAndRefreshToken(user) {
    try {
        const refreshToken = await prismaObject_1.default.user.generateRefreshToken(user.id);
        const accessToken = await prismaObject_1.default.user.generateAccessToken(user.id);
        const updateRefreshToken = await prismaObject_1.default.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken,
            },
        });
        if (!updateRefreshToken) {
            throw new ApiErrors_1.ApiErrors(500, "try login again");
        }
        // await user.save({ validateBeforeSave: false });
        return { refreshToken, accessToken };
    }
    catch (error) {
        throw new ApiErrors_1.ApiErrors(500, "Something went wrong while generating referesh and access token");
    }
}
const registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // return res
    const { name, adhar_card, mobile, email, password } = req.body;
    if (!name || !adhar_card || !mobile || !password) {
        return res
            .status(400) // Bad Request
            .json(new ApiResponse_1.ApiResponse(400, "", "Missing required fields"));
    }
    const existinguser = await prismaObject_1.default.user.findFirst({
        where: { OR: [{ mobile: mobile }, { adhar_card: adhar_card }] },
    });
    if (existinguser) {
        return res
            .status(409)
            .json(new ApiResponse_1.ApiResponse(409, {}, "User already exists"));
    }
    const user = await prismaObject_1.default.user.create({
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
            .json(new ApiResponse_1.ApiResponse(500, "", "someting went wrong please try again"));
    }
    const { refreshToken, accessToken } = await generteAccessAndRefreshToken(user);
    const returnUser = {
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
        .json(new ApiResponse_1.ApiResponse(201, returnUser, "User registered successfully"));
});
exports.registerUser = registerUser;
///////////////////////////////////////////////////
//////////////////////////////////////////////////
///////////////////////////////////////////////////
////////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////////////////////////////////////////////
////////////////////////////////////////////////////
const loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, {}, "Mobile and password are required"));
    }
    const user = await prismaObject_1.default.user.findUnique({
        where: { mobile },
    });
    if (!user) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, {}, "User not found"));
    }
    const isPasswordCorrect = await prismaObject_1.default.user.isPasswordCorrect(user.id, password);
    if (!isPasswordCorrect) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invalid credentials"));
    }
    const { refreshToken, accessToken } = await generteAccessAndRefreshToken(user);
    const returnUser = {
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
        .json(new ApiResponse_1.ApiResponse(200, returnUser, "login successfully"));
});
exports.loginUser = loginUser;
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// LOGOUT USER
const logoutUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    // Clear tokens from the database
    const user = await prismaObject_1.default.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
    if (!user) {
        return res
            .status(500) // Internal Server Error
            .json(new ApiResponse_1.ApiResponse(500, "", "Something went wrong, Please try again"));
    }
    // Clear tokens from cookies
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse_1.ApiResponse(200, null, "Logout successful"));
});
exports.logoutUser = logoutUser;
///////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
const authoriseRefreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { refreshToken, accessToken } = await generteAccessAndRefreshToken(user);
    if (!refreshToken || !accessToken) {
        throw new ApiErrors_1.ApiErrors(500, "Failed to generate new tokens. Please try again.");
    }
    const returnToken = {
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
        .json(new ApiResponse_1.ApiResponse(200, returnToken, "login successfully"));
});
exports.authoriseRefreshToken = authoriseRefreshToken;
//////////////////////////////////////////
///////////////////////// ////////////////////////
///////////////////////////////////////////////////
// CHANGE PASSWORD
const changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, {}, "Old and new passwords are required"));
    }
    const user = await prismaObject_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, "User not found"));
    }
    const isPasswordCorrect = await bcrypt_1.default.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Old password is incorrect"));
    }
    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prismaObject_1.default.user.update({
        where: { id: userId },
        data: { password: newPassword },
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, null, "Password changed successfully"));
});
exports.changePassword = changePassword;
//////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// UPDATE USER
const updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { name, mobile, email, adhar_card } = req.body;
    if (!name || !mobile || !email || !adhar_card) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, {}, "All fields are required"));
    }
    const user = await prismaObject_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, {}, "User not found"));
    }
    const updatedUser = await prismaObject_1.default.user.update({
        where: { id: userId },
        data: { name, mobile, email, adhar_card },
        select: {
            email: true,
            name: true,
            mobile: true,
            adhar_card: true,
        },
    });
    if (!updatedUser) {
        return res
            .status(500) // Internal Server Error
            .json(new ApiResponse_1.ApiResponse(500, "", "Something went wrong, User not updated"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, updatedUser, "User updated successfully"));
});
exports.updateUser = updateUser;
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// GET USER
const getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const user = await prismaObject_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            adhar_card: true,
        },
    });
    if (!user) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, null, "There is no user"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, user, "User fetched successfully"));
});
exports.getUser = getUser;
//# sourceMappingURL=user.controllers.js.map