"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadInvoice = exports.viewInvoice = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
const html_pdf_node_1 = __importDefault(require("html-pdf-node"));
const path_1 = __importDefault(require("path"));
const helperFunction_1 = require("../utils/helperFunction");
////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
const formattedName = (authorizedPersonName) => {
    return authorizedPersonName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};
// ADD DONATION
const viewInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { receiptNo } = req.query;
    // Validate the phone number
    if (!receiptNo || typeof receiptNo !== "string") {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donation.findFirst({
        where: {
            receiptNo: Number(receiptNo),
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
    res.render("invoice", {
        donation: results,
        amountInWords: (0, helperFunction_1.numberToWords)(results?.amount || 0),
        formattedName: formattedName(results?.authorizedPersonName || ""),
        downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
    });
});
exports.viewInvoice = viewInvoice;
// ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
const DownloadInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Define the path to the EJS template
    const ejsTemplatePath = path_1.default.join(__dirname, "../../views/downloadableInvoice.ejs");
    // Data for the dynamic template (you might get this from your database or request)
    const { receiptNo } = req.query;
    if (!receiptNo || typeof receiptNo !== "string") {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invoice number is required"));
    }
    // Query the database for the donor by phone number
    const results = await prismaObject_1.default.donation.findFirst({
        where: {
            receiptNo: Number(receiptNo), // Ensure the phone number is treated as a string
        },
        include: {
            items: true,
        },
    });
    if (!results) {
        return res.status(401).json(new ApiResponse_1.ApiResponse(401, "", "Donor not found"));
    }
    const donation = results;
    // Render the EJS template with the dynamic data
    res.render(ejsTemplatePath, {
        donation,
        amountInWords: (0, helperFunction_1.numberToWords)(results?.amount || 0),
        formattedName: formattedName(results?.authorizedPersonName || ""),
    }, async (err, htmlContent) => {
        if (err) {
            console.error("Error rendering the EJS template:", err);
            return res
                .status(500)
                .json(new ApiResponse_1.ApiResponse(500, "", "Failed to load the invoice template"));
        }
        // Check the type of download requested (HTML or PDF)
        if (req.query.type === "html") {
            // Serve the HTML as a downloadable file
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Content-Disposition", 'attachment; filename="donation-reciept.html"');
            return res.send(htmlContent); // Send the HTML content as a file
        }
        // Otherwise, generate PDF
        const options = {
            format: "Letter",
            margin: { right: "10mm", left: "10mm" },
            orientation: "landscape",
        };
        // Generate the PDF buffer
        const pdfBuffer = await html_pdf_node_1.default.generatePdf({ content: htmlContent }, options);
        // Set headers and send the PDF to the client
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="Donation-Reciept.pdf"');
        res.send(pdfBuffer); // Send the generated PDF buffer
    });
});
exports.DownloadInvoice = DownloadInvoice;
//# sourceMappingURL=invoice.controllers.js.map