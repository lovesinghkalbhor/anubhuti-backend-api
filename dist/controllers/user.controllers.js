"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiErrors_1 = require("../utils/ApiErrors");
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
            .status(201)
            .json(new ApiResponse_1.ApiResponse(401, "", "Missing required fields"));
    }
    const existinguser = await prismaObject_1.default.user.findFirst({
        where: { OR: [{ mobile: mobile }, { adhar_card: adhar_card }] },
    });
    if (existinguser) {
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(401, "", "Aadhar or mobile number is already used"));
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
    if (!password) {
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(400, "", "Please enter your password"));
    }
    if (!mobile) {
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(400, "", "Please enter your password"));
    }
    const user = await prismaObject_1.default.user.findUnique({
        where: { mobile },
    });
    if (!user) {
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(400, "", "User or Password incorrect"));
    }
    const isPasswordCorrect = await prismaObject_1.default.user.isPasswordCorrect(user.id, password);
    if (!isPasswordCorrect) {
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(400, "", "User or Password incorrect"));
    }
    const { refreshToken, accessToken } = await generteAccessAndRefreshToken(user);
    const returnUser = {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
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
const logoutUser = (0, asyncHandler_1.asyncHandler)(async () => { });
exports.logoutUser = logoutUser;
//# sourceMappingURL=user.controllers.js.map