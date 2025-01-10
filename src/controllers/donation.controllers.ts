import { asyncHandler } from "../utils/asyncHandler";
import { ApiErrors } from "../utils/ApiErrors";
import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { User, Donation } from "@prisma/client";
import prisma from "../utils/prismaObject";
import { sendMessage } from "../utils/sendingSMS";

////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// ADD DONATION
const addDonation = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;
  // console.log(user);

  // Extract fields from request body
  const {
    address,
    donorName,
    items,
    aadhar,
    pan,
    phoneNumber,
    amount,
    purpose,
  } = req.body;

  // Validate basic required fields
  if (!address || !donorName || !purpose?.trim()) {
    return res
      .status(422) // Unprocessable Entity - better for validation errors
      .json(
        new ApiResponse(
          422,
          null,
          "Required fields missing: donor name, address, and purpose are mandatory"
        )
      );
  }

  // Validate amount if provided
  if (
    (!items || !items.length) &&
    amount !== undefined &&
    (isNaN(amount) || amount <= 0)
  ) {
    return res
      .status(422)
      .json(new ApiResponse(422, null, "Amount must be a positive number"));
  }
  // Validate items structure
  if (items && !Array.isArray(items)) {
    return res
      .status(422)
      .json(new ApiResponse(422, null, "Items must be provided as an array"));
  }

  // Validate donation content
  if (!amount && (!items || items.length === 0)) {
    return res
      .status(422)
      .json(
        new ApiResponse(
          422,
          null,
          "Either monetary amount or items must be provided for donation"
        )
      );
  }

  // Validate identification documents
  if (!aadhar && !pan) {
    return res
      .status(422)
      .json(
        new ApiResponse(
          422,
          null,
          "Either Aadhar or PAN number is required for donation"
        )
      );
  }

  // Generate receipt number
  const lastDonation = await prisma.donation.findFirst({
    orderBy: { receiptNo: "desc" },
  });

  const receiptNo = lastDonation ? lastDonation.receiptNo + 1 : 1; // Increment receipt number or start with 1

  if (!Array.isArray(items)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "items should be an array"));
  }

  // Create a new donation record
  const donation = await prisma.donation.create({
    data: {
      receiptNo,
      authorizedPersonName: user.name,
      authorizedPersonId: user.id,
      donorName,
      aadhar: String(aadhar),
      pan: String(pan),
      phoneNumber: String(phoneNumber),
      address,
      amount: Number(amount),
      purpose,
      items: items
        ? {
            create: items.map((item: { name: string; quantity: string }) => ({
              name: item.name,
              quantity: Number(item.quantity),
            })),
          }
        : undefined,
    },
    include: {
      items: true,
    },
  });

  if (!donation) {
    return res
      .status(500) // Internal Server Error - database operation failed
      .json(new ApiResponse(500, null, "Failed to create donation record"));
  }

  // Send invoice link
  try {
    await sendMessage(
      `Download your donation receipt: http://localhost:3000/api/v1/viewInvoice/downloadInvoice?receiptNo=${donation.receiptNo}`
    );
  } catch (error) {
    console.error("Failed to send invoice message twilio");
    // Continue with response as message sending is not critical
    return res
      .status(500) // Created - successful resource creation
      .json(
        new ApiResponse(
          500,
          donation,
          "Donation recorded successfully. Receipt has been sent."
        )
      );
  }

  // Respond with the created donation record

  return res
    .status(201) // Created - successful resource creation
    .json(
      new ApiResponse(
        201,
        donation,
        "Donation recorded successfully. Receipt has been sent."
      )
    );
});

////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
interface SearchPaginationParams {
  page: number;
  limit: number;
  skip: number;
}
const getPaginationParams = (query: any): SearchPaginationParams => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(query.limit as string) || 10)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
// GET DONATION LIST
const getDonationList = asyncHandler(async (req: Request, res: Response) => {
  // Extract pagination parameters with defaults
  const { page, limit, skip } = getPaginationParams(req.query);

  // Get total count for pagination
  const totalDonations = await prisma.donation.count();

  // Get paginated donations
  const donations = await prisma.donation.findMany({
    skip,
    take: limit,
    // include: {
    //   items: true,
    // },
    orderBy: {
      date: "desc", // Most recent donations first
    },
    select: {
      receiptNo: true,
      date: true,
      authorizedPersonName: true,
      donorName: true,
      phoneNumber: true,
      amount: true,
      items: true,
      _count: {
        select: { items: true },
      },
    },
  });

  const totalPages = Math.ceil(totalDonations / limit);
  const hasMore = page < totalPages;

  // If no donations found
  if (!donations || donations.length === 0) {
    return res
      .status(200) // No Content - successful request but no data
      .json(
        new ApiResponse(
          200,
          {
            donations: [],
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalDonations,
              hasMore: false,
            },
          },
          "No donations available"
        )
      );
  }

  // Successful response with data
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        donations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalDonations,
          hasMore,
        },
      },
      "Donations retrieved successfully"
    )
  );
});
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
const searchDonorByDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    // Validate search parameter
    if (!search || typeof search !== "string" || !search.trim()) {
      return res
        .status(422)
        .json(
          new ApiResponse(
            422,
            null,
            "Please provide a valid search term (Aadhar, mobile number, or name)"
          )
        );
    }

    const searchTerm = search.trim();

    // Build the where clause dynamically
    const whereClause = {
      OR: [
        { aadhar: searchTerm },
        { phoneNumber: searchTerm },
        { donorName: { contains: searchTerm } },
      ],
    };

    // Get total count for pagination
    const totalDonors = await prisma.donation.count({
      where: whereClause,
    });

    // Query the database with pagination
    const donations = await prisma.donation.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        date: "desc",
      },
      // include: {
      //   items: true,
      // },
      select: {
        receiptNo: true,
        date: true,
        authorizedPerson: true,
        donorName: true,
        phoneNumber: true,
        amount: true,
        items: true,
        _count: {
          select: { items: true },
        },
      },
    });

    const totalPages = Math.ceil(totalDonors / limit);
    const hasMore = page < totalPages;

    // No results found
    if (donations.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            donations: [],
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: totalDonors,
              hasMore: false,
            },
            searchTerm,
          },
          "No donor records found for the given search term"
        )
      );
    }

    // Success response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonors,
            hasMore,
          },
          searchTerm,
        },
        "Donor records fetched successfully"
      )
    );
  }
);

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// const searchDonationsByDate = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { startDate, endDate } = req.query;

//     // Validate date range inputs
//     if (!startDate || !endDate) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(400, "", "Please provide both startDate and endDate.")
//         );
//     }

//     const start = new Date(startDate as string);
//     const end = new Date(endDate as string);

//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             "",
//             "Invalid date format. Please use YYYY-MM-DD format."
//           )
//         );
//     }

//     if (start > end) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(400, "", "startDate cannot be later than endDate.")
//         );
//     }

//     // Query the database
//     const donations = await prisma.donation.findMany({
//       where: {
//         date: {
//           gte: start,
//           lte: end,
//         },
//       },
//     });

//     if (donations.length === 0) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             "",
//             "No donations found for the given date range."
//           )
//         );
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, donations, "Donations fetched successfully"));
//   }
// );
const searchDonationsByDate = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    // Validate date parameters
    if (!startDate || !endDate) {
      return res
        .status(422)
        .json(
          new ApiResponse(
            422,
            null,
            "Both startDate and endDate are required (format: YYYY-MM-DD)"
          )
        );
    }

    // Parse and validate dates
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(422)
        .json(
          new ApiResponse(
            422,
            null,
            "Invalid date format. Please use YYYY-MM-DD format"
          )
        );
    }

    if (start > end) {
      return res
        .status(422)
        .json(
          new ApiResponse(
            422,
            null,
            "Start date must be earlier than or equal to end date"
          )
        );
    }

    const whereClause = {
      date: {
        gte: start,
        lte: end,
      },
    };

    // Get total count for pagination
    const totalDonations = await prisma.donation.count({
      where: whereClause,
    });

    // Query the database with pagination
    const donations = await prisma.donation.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        date: "desc",
      },
      select: {
        receiptNo: true,
        date: true,
        authorizedPerson: true,
        donorName: true,
        phoneNumber: true,
        amount: true,
        items: true,
        _count: {
          select: { items: true },
        },
      },
    });

    const totalPages = Math.ceil(totalDonations / limit);
    const hasMore = page < totalPages;

    // No results found
    if (donations.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            donations: [],
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: totalDonations,
              hasMore: false,
            },
            dateRange: { startDate, endDate },
          },
          "No donations found for the given date range"
        )
      );
    }

    // Success response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonations,
            hasMore,
          },
          dateRange: { startDate, endDate },
        },
        "Donations fetched successfully"
      )
    );
  }
);

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

// GET DONATION BY ID
const getDonationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const donation = await prisma.donation.findUnique({
    where: { id: Number(id) },
    include: {
      items: true, // Include related items for item donations
    },
  });

  if (!donation) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Donation not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation retrieved successfully"));
});

export {
  getDonationList,
  addDonation,
  getDonationById,
  searchDonorByDetails,
  searchDonationsByDate,
};
