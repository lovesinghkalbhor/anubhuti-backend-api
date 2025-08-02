import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../utils/prismaObject";
import { sendMessage } from "../utils/sendingSMS";
import {
  filteredMissingFieldsObjectFromItems,
  receiptNoGenerator,
  validateDonationInput,
  validateDonationInputIMPS,
} from "../utils/helperFunction";
import {
  DonationCategory,
  PaymentMethod,
  SearchPaginationParams,
} from "../types/types";

// ADD DONATION
///////////////////////////////////////////////////////////////////////////////////

const addDonation = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;

  // Extract fields from request body
  const {
    countryCode,
    phoneNumber,
    donorName,
    address,
    purpose,
    amount,
    aadhar,
    pan,
    paymentMethod,
    donationCategory,
    donationDate,
  } = req.body;
  let message = "Message sent Successfully";

  const validationError = validateDonationInput({
    donorName,
    address,
    purpose,
    amount,
    aadhar,
    pan,
    phoneNumber,
    countryCode,
    donationCategory,
    paymentMethod,
    donationDate,
    items: [],
    donationType: "money",
  });

  if (validationError) {
    return res.status(validationError.statusCode).json(validationError);
  }

  // Generate receipt number
  const lastDonationPromise = await prisma.donation.findFirst({
    orderBy: { id: "desc" },
    select: { receiptNo: true }, // select only needed field for performance
  });

  const receiptNo = receiptNoGenerator(
    lastDonationPromise ? lastDonationPromise.receiptNo : "",
    "M"
  );
  // const receiptNo = lastDonation ? lastDonation.receiptNo + 1 : 1; // Increment receipt number or start with 1

  // Create a new donation record
  const donation = await prisma.donation.create({
    data: {
      receiptNo,
      authorizedPersonName: user.name,
      authorizedPersonId: user.id,
      donorName,
      date: new Date(donationDate),
      createdAt: new Date().toISOString(),
      countryCode,
      aadhar: String(aadhar),
      pan: String(pan),
      phoneNumber: String(phoneNumber),
      address,
      amount: Number(amount),
      purpose,
      paymentMethod,
      donationCategory:
        DonationCategory[donationCategory as keyof typeof DonationCategory] ||
        donationCategory,
    },
  });

  if (!donation) {
    return res
      .status(500) // Internal Server Error - database operation failed
      .json(new ApiResponse(500, null, "Failed to create donation record"));
  }

  // Send invoice link

  await sendMessage(
    `Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_MONEY}=${donation.id}`,
    countryCode + phoneNumber
  ).catch((err) => {
    message = "Message sending failed";
    console.error("Message sending failed:", err);
  });
  // Respond with the created donation record

  return res
    .status(201) // Created - successful resource creation
    .json(
      new ApiResponse(
        201,
        donation,

        `Donation recorded successfully, ${message}`
      )
    );
});

// ADD DONATION IMPS
////////////////////////////////////////////////////////////////////
const addDonationIMPS = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;

  // Extract fields from request body
  const { purpose, amount, paymentMethod, donationDate } = req.body;

  console.log(amount);
  const validationError = validateDonationInputIMPS({
    purpose,
    amount,
    paymentMethod,
    donationDate,

    donationType: "money",
  });

  if (validationError) {
    return res.status(validationError.statusCode).json(validationError);
  }

  // Generate receipt number
  const lastDonationPromise = await prisma.donation.findFirst({
    orderBy: { id: "desc" },
    select: { receiptNo: true }, // select only needed field for performance
  });

  const receiptNo = receiptNoGenerator(
    lastDonationPromise ? lastDonationPromise.receiptNo : "",
    "M"
  );
  // const receiptNo = lastDonation ? lastDonation.receiptNo + 1 : 1; // Increment receipt number or start with 1

  // Create a new donation record
  const donation = await prisma.donation.create({
    data: {
      receiptNo,
      authorizedPersonName: user.name,
      authorizedPersonId: user.id,
      donorName: "",
      date: new Date(donationDate),
      countryCode: "+91",
      aadhar: "",
      pan: "",
      phoneNumber: "",
      address: "",
      amount: Number(amount),
      purpose,
      paymentMethod,
      donationCategory: "",
    },
  });

  if (!donation) {
    return res
      .status(500) // Internal Server Error - database operation failed
      .json(new ApiResponse(500, null, "Failed to create donation record"));
  }

  // Respond with the created donation record

  return res
    .status(201) // Created - successful resource creation
    .json(
      new ApiResponse(
        201,
        donation,

        `Donation recorded successfully`
      )
    );
});

// Edit DONATION
//////////////////////////////////////////////////////////////////
const editDonation = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;

  // Extract fields from request body
  const {
    donationId,
    address,
    donorName,
    aadhar,
    countryCode,
    pan,
    phoneNumber,
    amount,
    purpose,
    paymentMethod,
    donationCategory,
    donationDate,
  } = req.body;

  let message = "Message sent Successfully";

  if (!donationId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Donation ID is required"));
  }

  const validationError = validateDonationInput({
    donorName,
    address,
    purpose,
    amount,
    aadhar,
    pan,
    phoneNumber,
    countryCode,
    donationCategory,
    paymentMethod,
    donationDate,
    items: [],
    donationType: "money",
  });

  if (validationError) {
    return res.status(validationError.statusCode).json(validationError);
  }

  // Update donation directly and check affected rows
  const updatedDonation = await prisma.donation.update({
    where: { id: Number(donationId) },
    data: {
      // authorizedPersonName: user.name,
      updatedByPersonName: user.name,
      updatedByPersonId: user.id,

      date: new Date(donationDate),
      updatedAt: new Date().toISOString(),

      donorName,
      aadhar,
      countryCode,
      pan,
      phoneNumber,
      address,
      amount: Number(amount),
      purpose,
      paymentMethod,
      donationCategory:
        DonationCategory[donationCategory as keyof typeof DonationCategory] ||
        donationCategory,
    },
    // select: { id: true },
  });

  if (!updatedDonation) {
    return res.status(404).json(new ApiResponse(404, {}, "Donation not found"));
  }

  // Send invoice link asynchronously (doesn't delay response)
  await sendMessage(
    `Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_MONEY}=${donationId}`,
    countryCode + phoneNumber
  ).catch((err) => {
    message = "Message sending failed";
    console.error("Message sending failed:", err);
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Donation updated successfully,${message}`));
});

// helper function
////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////
const getDonationList = asyncHandler(async (req: Request, res: Response) => {
  // Extract pagination parameters with defaults
  const { page, limit, skip } = getPaginationParams(req.query);

  // Parallel DB calls: count + fetch donations
  const [totalDonations, donations] = await Promise.all([
    prisma.donation.count(),
    prisma.donation.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        receiptNo: true,
        date: true,
        authorizedPersonName: true,
        updatedByPersonName: true,
        createdAt: true,
        updatedAt: true,
        donorName: true,
        phoneNumber: true,
        aadhar: true,
        pan: true,
        paymentMethod: true,
        amount: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalDonations / limit);
  const hasMore = page < totalPages;

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
      donations.length
        ? "Donations retrieved successfully"
        : "No donations available"
    )
  );
});

// search donation
//////////////////////////////////////////////////////////////////////
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
        { purpose: { contains: searchTerm } },
      ],
    };

    // Run both queries in parallel
    const [totalDonors, donations] = await Promise.all([
      prisma.donation.count({ where: whereClause }),
      prisma.donation.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          receiptNo: true,
          authorizedPersonName: true,
          updatedByPerson: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          donorName: true,
          phoneNumber: true,
          aadhar: true,
          pan: true,
          paymentMethod: true,
          amount: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalDonors / limit);
    const hasMore = page < totalPages;

    // No results found
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
        donations.length
          ? "Donor records fetched successfully"
          : "No donor records found for the given search term"
      )
    );
  }
);

// filter donation
/////////////////////////////////////////////////////////////////
const filterDonation = asyncHandler(async (req: Request, res: Response) => {
  const { paymentMethod = "", donationCategory = "" } = req.query;
  const { page, limit, skip } = getPaginationParams(req.query);

  if (paymentMethod == "" && donationCategory == "") {
    return res
      .status(422)
      .json(new ApiResponse(422, null, "Please provide a valid filter"));
  }
  // Validate search parameter by donation category]
  if (
    !((donationCategory as string) in DonationCategory) &&
    donationCategory != ""
  ) {
    return res
      .status(422)
      .json(
        new ApiResponse(
          422,
          null,
          "Please provide a valid filter (SCHOOL,MEMBERSHIP,LUNCH,IN_KIND,LAND_AND_BUILDING,OTHER)"
        )
      );
  }

  if (!((paymentMethod as string) in PaymentMethod) && paymentMethod != "") {
    return res
      .status(422)
      .json(
        new ApiResponse(
          422,
          null,
          "Please provide a valid filter (UPI,DD,CASH,CHEQUE)"
        )
      );
  }

  // Build the where clause dynamically
  const whereClause = {
    AND: [
      {
        OR: [
          {
            donationCategory: {
              startsWith:
                DonationCategory[
                  donationCategory as keyof typeof DonationCategory
                ],
            },
          },
          // { donationCategory: { startsWith: "OTHER" } },
        ],
      },
      {
        paymentMethod: {
          startsWith: paymentMethod as string,
        },
      },
    ],
  };

  // Get total count for pagination
  const [totalDonors, donations] = await Promise.all([
    prisma.donation.count({ where: whereClause }),
    prisma.donation.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { id: "desc" },

      select: {
        id: true,
        receiptNo: true,
        authorizedPersonName: true,
        updatedByPerson: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        donorName: true,
        phoneNumber: true,
        aadhar: true,
        pan: true,
        paymentMethod: true,
        amount: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalDonors / limit);
  const hasMore = page < totalPages;

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
      },
      donations.length
        ? "Donor records fetched successfully"
        : "No donor records found for the given filters"
    )
  );
});

// search by date
///////////////////////////////////////////////////////////////
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

    // 🧠 Parallel DB calls using Promise.all
    const [donations, totalDonations] = await Promise.all([
      prisma.donation.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          receiptNo: true,
          authorizedPersonName: true,
          updatedByPerson: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          donorName: true,
          phoneNumber: true,
          aadhar: true,
          pan: true,
          paymentMethod: true,
          amount: true,
        },
      }),
      prisma.donation.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalDonations / limit);
    const hasMore = page < totalPages;

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
        donations.length === 0
          ? "No donations found for the given date range"
          : "Donations fetched successfully"
      )
    );
  }
);

// data for excel
//////////////////////////////////////////////////////////////////
const searchDonationsByDateForExcel = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    // const { page, limit, skip } = getPaginationParams(req.query);

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

    // 🧠 Parallel DB calls using Promise.all
    const [donations, totalDonations] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          receiptNo: string;
          authorizedPersonName: string;
          date: string;

          updatedByPersonName: string;
          createdAt: string;
          updatedAt: string;

          donorName: string;
          phoneNumber: string;
          aadhar: string | null;
          pan: string | null;
          paymentMethod: string;
          purpose: string;
          donationCategory: string;
          amount: number | null;
        }>
      >`
        SELECT 
          receiptNo,
          authorizedPersonName,
          updatedByPersonName,
          DATE_FORMAT(date, '%d/%m/%Y') as date,
          DATE_FORMAT(createdAt, '%d/%m/%Y') as createdAt,
          DATE_FORMAT(updatedAt, '%d/%m/%Y') as updatedAt,
          donorName,
          phoneNumber,
          aadhar,
          pan,
          paymentMethod,
          purpose,
          donationCategory,
          amount
        FROM Donation 
        WHERE date >= ${start} AND date <= ${end}
        ORDER BY id DESC
      `,
      prisma.donation.count({ where: whereClause }),
    ]);

    // const totalPages = Math.ceil(totalDonations / limit);
    // const hasMore = page < totalPages;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: totalDonations,
            hasMore: false,
          },
          dateRange: { startDate, endDate },
        },
        donations.length === 0
          ? "No donations found for the given date range"
          : "Donations fetched successfully"
      )
    );
  }
);

// total donation calculation
////////////////////////////////////////////////////////
const calculateDonationsByDate = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    // const { page, limit, skip } = getPaginationParams(req.query);

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

    // Query the database with pagination
    const { _sum } = await prisma.donation.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalDonations: _sum.amount ?? 0,
          dateRange: { startDate: startDate, endDate: endDate },
        },
        _sum.amount
          ? "Donations fetched successfully"
          : "No donations found for the given date range"
      )
    );
  }
);

// GET DONATION BY ID
////////////////////////////////////////////////////////
const getDonationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const donation = await prisma.donation.findUnique({
    where: { id: Number(id) },
  });

  if (!donation) {
    return res.status(404).json(new ApiResponse(404, {}, "Donation not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation retrieved successfully"));
});

// kinds donation starts form here
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
// ADD DONATION kinds
const addDonationKinds = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;

  // Extract fields from request body
  const {
    address,
    donorName,
    items,
    aadhar,
    countryCode,
    pan,
    phoneNumber,
    purpose,
    donationCategory,
    donationDate,
  } = req.body;
  let message = "Message sent Successfully";

  const validationError = validateDonationInput({
    donorName,
    address,
    purpose,
    aadhar,
    pan,
    phoneNumber,
    countryCode,
    items,
    donationCategory,
    donationDate,
    donationType: "kind",
  });

  if (validationError) {
    return res.status(validationError.statusCode).json(validationError);
  }

  // fileter the valid item in kind
  const filterItems = filteredMissingFieldsObjectFromItems(items);

  // Generate receipt number
  const lastDonation = await prisma.donationKinds.findFirst({
    orderBy: { id: "desc" },
  });

  const receiptNo = receiptNoGenerator(
    lastDonation ? lastDonation.receiptNo : "",
    "K"
  );

  // Create a new donation record
  const donation = await prisma.donationKinds.create({
    data: {
      receiptNo,
      authorizedPersonName: user.name,
      authorizedPersonId: user.id,
      createdAt: new Date().toISOString(),

      donorName,
      countryCode,
      date: new Date(donationDate),
      aadhar: String(aadhar),
      pan: String(pan),
      phoneNumber: String(phoneNumber),
      address,
      purpose,
      donationCategory:
        DonationCategory[donationCategory as keyof typeof DonationCategory] ||
        donationCategory,
      items: filterItems
        ? {
            create: filterItems.map(
              (item: {
                name: string;
                quantity: string;
                approxAmount: number;
              }) => ({
                name: item.name,
                quantity: String(item.quantity),
                approxAmount: +item.approxAmount,
              })
            ),
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

  await sendMessage(
    `Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_KIND}=${donation.id}`,
    countryCode + phoneNumber
  ).catch((err) => {
    message = "Message sending failed";
    console.error("Message sending failed:", err);
  });

  // Respond with the created donation record

  return res
    .status(201) // Created - successful resource creation
    .json(
      new ApiResponse(
        201,
        donation,
        `Donation recorded successfully, ${message}`
      )
    );
});

// edit kind donation
////////////////////////////////////////////////////////////
const editKindDonation = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: any }).user;
  // Extract fields from request body
  const {
    donationId,
    address,
    donorName,
    aadhar,
    countryCode,
    pan,
    items,
    phoneNumber,
    purpose,
    donationCategory,
    donationDate,
  } = req.body;
  let message = "Message sent Successfully";
  if (!donationId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Donation ID is required"));
  }

  const validationError = validateDonationInput({
    donorName,
    address,
    purpose,
    aadhar,
    pan,
    phoneNumber,
    countryCode,
    items,
    donationCategory,
    donationType: "kind",
    donationDate,
  });

  if (validationError) {
    return res.status(validationError.statusCode).json(validationError);
  }

  // fileter the valid item in kind
  const filterItems = filteredMissingFieldsObjectFromItems(items);

  // Create a new donation record
  const updatedDonation = await prisma.donationKinds.update({
    where: { id: Number(donationId) },
    data: {
      // authorizedPersonName: user.name,
      // authorizedPersonId: user.id,
      updatedByPersonName: user.name,
      updatedByPersonId: user.id,

      date: new Date(donationDate),
      updatedAt: new Date().toISOString(),

      donorName,
      countryCode,
      aadhar: String(aadhar),
      pan: String(pan),
      phoneNumber: String(phoneNumber),
      address,
      purpose,
      donationCategory:
        DonationCategory[donationCategory as keyof typeof DonationCategory] ||
        donationCategory,
      items: filterItems
        ? {
            deleteMany: { donationId: Number(donationId) },
            create: filterItems.map(
              (item: {
                name: string;
                quantity: string;
                approxAmount: number;
              }) => ({
                name: item.name,
                quantity: String(item.quantity),
                approxAmount: +item.approxAmount,
              })
            ),
          }
        : undefined,
    },
  });

  if (!updatedDonation) {
    return res
      .status(504)
      .json(new ApiResponse(504, {}, "Failed to update donation"));
  }

  // Send invoice link asynchronously (doesn't delay response)
  await sendMessage(
    `Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_KIND}=${donationId}`,
    countryCode + phoneNumber
  ).catch((err) => {
    message = "Message sending failed";
    console.error("Message sending failed:", err);
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, `Donation updated successfully, ${message}`)
    );
});

// GET kinds DONATION LIST
//////////////////////////////////////////////////////////////////////////////////////
const getDonationKindsList = asyncHandler(
  async (req: Request, res: Response) => {
    // Extract pagination parameters with defaults
    const { page, limit, skip } = getPaginationParams(req.query);

    // Use Promise.all to parallelize count and findMany
    const [totalItems, donations] = await Promise.all([
      prisma.donationKinds.count(),
      prisma.donationKinds.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          receiptNo: true,
          authorizedPersonName: true,
          updatedByPersonName: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          donorName: true,
          phoneNumber: true,
          aadhar: true,
          pan: true,
          _count: { select: { items: true } },
          // items can be excluded or limited if not required here
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
          },
        },
        donations.length
          ? "Donations retrieved successfully"
          : "No donations available"
      )
    );
  }
);

// kinds Donation search list
//////////////////////////////////////////////////////////
const searchKindsDonorByDetails = asyncHandler(
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

    // Run both queries in parallel for speed
    const [totalItems, donations] = await Promise.all([
      prisma.donationKinds.count({ where: whereClause }),
      prisma.donationKinds.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          receiptNo: true,
          authorizedPersonName: true,
          updatedByPersonName: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          donorName: true,
          phoneNumber: true,
          aadhar: true,
          pan: true,
          _count: { select: { items: true } },
          // You can remove "items" field here if not critical
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
          },
          searchTerm,
        },
        donations.length
          ? "Donor records fetched successfully"
          : "No donor records found for the given search term"
      )
    );
  }
);

// filter kind donations
///////////////////////////////////////////////////////////////
const filterKindsDonation = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentMethod = "", donationCategory = "" } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    if (!paymentMethod && !donationCategory) {
      return res
        .status(422)
        .json(new ApiResponse(422, null, "Please provide a valid filter"));
    }
    // Validate search parameter by donation category]
    if (
      !((donationCategory as string) in DonationCategory) &&
      donationCategory != ""
    ) {
      return res
        .status(422)
        .json(
          new ApiResponse(
            422,
            null,
            "Please provide a valid filter (SCHOOL_HOSTEL_OPERATIONS,LIFETIME_MEMBERSHIP,LIFETIME_LUNCH,IN_KIND,LAND_AND_BUILDING,OTHER)"
          )
        );
    }

    if (!((paymentMethod as string) in PaymentMethod) && paymentMethod != "") {
      return res
        .status(422)
        .json(
          new ApiResponse(
            422,
            null,
            "Please provide a valid filter (UPI,DD,CASH,CHEQUE)"
          )
        );
    }

    // Build the where clause dynamically
    const whereClause = {
      AND: [
        {
          OR: [
            { donationCategory: donationCategory as string },
            { donationCategory: { startsWith: "OTHER" } },
          ],
        },
        // {
        //   paymentMethod: {
        //     startsWith: paymentMethod as string,
        //   },
        // },
      ],
    };

    // Run count and data fetch in parallel
    const [totalItems, donations] = await Promise.all([
      prisma.donationKinds.count({ where: whereClause }),
      prisma.donationKinds.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          receiptNo: true,
          authorizedPersonName: true,
          updatedByPersonName: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          donorName: true,
          phoneNumber: true,
          aadhar: true,
          donationCategory: true,
          pan: true,
          _count: { select: { items: true } },
          items: true, // Optional: remove if not needed for speed
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
          },
        },
        donations.length
          ? "Filtered donor records fetched successfully"
          : "No donor records found for the given filter"
      )
    );
  }
);

// search kinds donation
///////////////////////////////////////////////////////////
const searchKindsDonationsByDate = asyncHandler(
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

    // Execute count and query in parallel
    const [totalItems, donations] = await Promise.all([
      prisma.donationKinds.count({ where: whereClause }),
      prisma.donationKinds.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          receiptNo: true,
          authorizedPersonName: true,
          updatedByPersonName: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          donorName: true,
          phoneNumber: true,
          aadhar: true,
          pan: true,
          items: true, // Optional: exclude if heavy
          _count: { select: { items: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
          },
          dateRange: { startDate, endDate },
        },
        donations.length
          ? "Donations fetched successfully"
          : "No donations found for the given date range"
      )
    );
  }
);

// search kinds donation
//////////////////////////////////////////////////////////////
const searchKindsDonationsByDateExcel = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

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

    // Execute count and query in parallel
    const [totalItems, donations] = await Promise.all([
      prisma.donationKinds.count({ where: whereClause }),
      prisma.donationKinds.findMany({
        where: whereClause,
        // include: { items: true },
        select: {
          // id: true,
          receiptNo: true,
          date: true,
          createdAt: true,

          authorizedPersonName: true,

          donorName: true,
          aadhar: true,
          pan: true,
          phoneNumber: true,
          address: true,
          purpose: true,
          donationCategory: true,

          items: true, // Optional: exclude if heavy
          _count: { select: { items: true } },
        },
        orderBy: { id: "desc" },
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems,
            hasMore: false,
          },
          dateRange: { startDate, endDate },
        },
        donations.length
          ? "Donations fetched successfully"
          : "No donations found for the given date range"
      )
    );
  }
);

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return date.toLocaleString();
}
// GET DONATION BY ID
/////////////////////////////////////////////////////////
const getKindsDonationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const donation = await prisma.donationKinds.findUnique({
      where: { id: Number(id) },
      include: {
        items: true, // Include related items for item donations
      },
    });

    if (!donation) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Donation not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, donation, "Donation retrieved successfully"));
  }
);

// is helper function
/////////////////////////////////////////////////////////
const sendMessageOnMobile = asyncHandler(
  async (req: Request, res: Response) => {
    const { number } = req.params;
    await sendMessage(
      "Thanks for contacting Anubhuti Vision Sewa Sansthan to shower your blessings on SPECIAL CHILDREN We warmly invite you to visit again to serve humanity.",
      number
    ).catch((err) => {
      "Message sending failed";
      console.error("Message sending failed:", err);
    });
  }
);

export {
  getDonationList,
  addDonation,
  addDonationKinds,
  getDonationById,
  searchDonorByDetails,
  searchDonationsByDate,
  calculateDonationsByDate,
  filterDonation,
  getKindsDonationById,
  searchKindsDonationsByDate,
  filterKindsDonation,
  searchKindsDonorByDetails,
  getDonationKindsList,
  editDonation,
  editKindDonation,
  searchDonationsByDateForExcel,
  searchKindsDonationsByDateExcel,
  sendMessageOnMobile,
  addDonationIMPS,
};
