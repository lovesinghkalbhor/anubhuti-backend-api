"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadKindsInvoiceMobile = exports.DownloadInvoiceMobile = exports.DownloadKindsInvoice = exports.viewkindInvoice = exports.DownloadInvoice = exports.viewInvoice = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
const helperFunction_1 = require("../utils/helperFunction");
////////////////////////////////////////////////////////////////////////////////////////////////
const formattedName = (authorizedPersonName) => {
    return authorizedPersonName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};
// ADD DONATION
const viewInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    // Validate the phone number
    if (!id) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donation.findFirst({
        where: {
            id: Number(id),
            // Ensure the phone number is treated as a string
        },
    });
    if (!results) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Donor not found,can not generate reciept"));
    }
    res.render("invoice", {
        donation: results,
        amountInWords: (0, helperFunction_1.numberToWords)(results?.amount || 0),
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
    });
});
exports.viewInvoice = viewInvoice;
//////////////////////////////////////////////////////
////////////////////////////////////////////////////
const viewkindInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    // Validate the phone number
    if (!id) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donationKinds.findFirst({
        where: {
            id: Number(id),
            // Ensure the phone number is treated as a string
        },
        include: {
            items: true,
        },
    });
    if (!results) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Donor not found,can not generate reciept"));
    }
    res.render("kindinvoice", {
        donation: results,
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
    });
});
exports.viewkindInvoice = viewkindInvoice;
//////////////////////////////////////////////////////
/////////////////////////////////////////
const DownloadInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    // Validate the phone number
    if (!id) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donation.findFirst({
        where: {
            id: Number(id),
            // Ensure the phone number is treated as a string
        },
    });
    if (!results) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Donor not found,can not generate reciept"));
    }
    res.render("downloadableInvoice", {
        donation: results,
        amountInWords: (0, helperFunction_1.numberToWords)(results?.amount || 0),
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
    });
});
exports.DownloadInvoice = DownloadInvoice;
//////////////////////////////////////////////////////
/////////////////////////////////////////
const DownloadKindsInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    // Validate the phone number
    if (!id) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donationKinds.findFirst({
        where: {
            id: Number(id),
            // Ensure the phone number is treated as a string
        },
        include: {
            items: true,
        },
    });
    if (!results) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Donor not found,can not generate reciept"));
    }
    res.render("downloadableKindsInvoice", {
        donation: results,
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
    });
});
exports.DownloadKindsInvoice = DownloadKindsInvoice;
//////////////////////////////////////////////////////
/////////////////////////////////////////
const DownloadInvoiceMobile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    // Validate the phone number
    if (!id) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donation.findFirst({
        where: {
            id: Number(id),
            // Ensure the phone number is treated as a string
        },
    });
    if (!results) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Donor not found,can not generate reciept new"));
    }
    res.render("downloadableInvoice-from-message", {
        donation: results,
        amountInWords: (0, helperFunction_1.numberToWords)(results?.amount || 0),
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL_MONEY,
    });
});
exports.DownloadInvoiceMobile = DownloadInvoiceMobile;
//////////////////////////////////////////////////////
/////////////////////////////////////////
const DownloadKindsInvoiceMobile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    // Validate the phone number
    if (!id) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donationKinds.findFirst({
        where: {
            id: Number(id),
            // Ensure the phone number is treated as a string
        },
        include: {
            items: true,
        },
    });
    if (!results) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Donor not found,can not generate reciept"));
    }
    res.render("downloadableKindsInvoice-from-message", {
        donation: results,
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL_KIND,
    });
});
exports.DownloadKindsInvoiceMobile = DownloadKindsInvoiceMobile;
//# sourceMappingURL=invoice.controllers.js.map