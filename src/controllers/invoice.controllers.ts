import { asyncHandler } from "../utils/asyncHandler";
import { ApiErrors } from "../utils/ApiErrors";
import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { User, Donation } from "@prisma/client";
import prisma from "../utils/prismaObject";
import html_to_pdf from "html-pdf-node";

import path from "path";
import { numberToWords } from "../utils/helperFunction";

////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
const formattedName = (authorizedPersonName: string) => {
  return authorizedPersonName
    .split(" ")
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};
// ADD DONATION
const viewInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { receiptNo } = req.query;

  // Validate the phone number
  if (!receiptNo || typeof receiptNo !== "string") {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invoice number is required"));
  }

  // Query the database for the donor by phone number
  const results = await prisma.donation.findFirst({
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
      .json(
        new ApiResponse(401, {}, "Donor not found,can not generate reciept")
      );
  }

  res.render("invoice", {
    donation: results,
    amountInWords: numberToWords(results?.amount || 0),
    formattedName: formattedName(results?.authorizedPersonName || ""),
    downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
  });
});

const DownloadInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { receiptNo } = req.query;

  // Validate the phone number
  if (!receiptNo || typeof receiptNo !== "string") {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invoice number is required"));
  }

  // Query the database for the donor by phone number
  const results = await prisma.donation.findFirst({
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
      .json(
        new ApiResponse(401, {}, "Donor not found,can not generate reciept")
      );
  }

  res.render("downloadableInvoice", {
    donation: results,
    amountInWords: numberToWords(results?.amount || 0),
    formattedName: formattedName(results?.authorizedPersonName || ""),
    downloadUrl: process.env.DOWNLOAD_RECEIPT_URL,
  });
});

// ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// const DownloadInvoice = asyncHandler(async (req: Request, res: Response) => {
//   // Define the path to the EJS template
//   const ejsTemplatePath = path.join(
//     __dirname,
//     "../../views/downloadableInvoice.ejs"
//   );

//   // Data for the dynamic template (you might get this from your database or request)

//   const { receiptNo } = req.query;

//   if (!receiptNo || typeof receiptNo !== "string") {
//     return res
//       .status(401)
//       .json(new ApiResponse(401, {}, "Invoice number is required"));
//   }

//   // Query the database for the donor by phone number
//   const results = await prisma.donation.findFirst({
//     where: {
//       receiptNo: Number(receiptNo), // Ensure the phone number is treated as a string
//     },
//     include: {
//       items: true,
//     },
//   });

//   if (!results) {
//     return res.status(401).json(new ApiResponse(401, "", "Donor not found"));
//   }

//   const donation = results;
//   // Render the EJS template with the dynamic data
//   res.render(
//     ejsTemplatePath,
//     {
//       donation,
//       amountInWords: numberToWords(results?.amount || 0),
//       formattedName: formattedName(results?.authorizedPersonName || ""),
//     },
//     async (err, htmlContent) => {
//       if (err) {
//         console.error("Error rendering the EJS template:", err);

//         return res
//           .status(500)
//           .json(
//             new ApiResponse(500, "", "Failed to load the invoice template")
//           );
//       }

//       // Check the type of download requested (HTML or PDF)
//       if (req.query.type === "html") {
//         // Serve the HTML as a downloadable file
//         res.setHeader("Content-Type", "text/html");
//         res.setHeader(
//           "Content-Disposition",
//           'attachment; filename="donation-reciept.html"'
//         );
//         return res.send(htmlContent); // Send the HTML content as a file
//       }

//       // Otherwise, generate PDF
//       const options = {
//         format: "Letter",
//         margin: { right: "10mm", left: "10mm" },
//         orientation: "landscape",
//       };

//       // Generate the PDF buffer
//       const pdfBuffer = await html_to_pdf.generatePdf(
//         { content: htmlContent },
//         options
//       );

//       // Set headers and send the PDF to the client
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         'attachment; filename="Donation-Reciept.pdf"'
//       );
//       res.send(pdfBuffer); // Send the generated PDF buffer
//     }
//   );
// });

////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

export { viewInvoice, DownloadInvoice };
