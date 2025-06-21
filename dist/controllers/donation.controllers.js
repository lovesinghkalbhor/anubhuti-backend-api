"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDonationIMPS = exports.sendMessageOnMobile = exports.searchKindsDonationsByDateExcel = exports.searchDonationsByDateForExcel = exports.editKindDonation = exports.editDonation = exports.getDonationKindsList = exports.searchKindsDonorByDetails = exports.filterKindsDonation = exports.searchKindsDonationsByDate = exports.getKindsDonationById = exports.filterDonation = exports.calculateDonationsByDate = exports.searchDonationsByDate = exports.searchDonorByDetails = exports.getDonationById = exports.addDonationKinds = exports.addDonation = exports.getDonationList = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
const sendingSMS_1 = require("../utils/sendingSMS");
const helperFunction_1 = require("../utils/helperFunction");
const types_1 = require("../types/types");
////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// ADD DONATION
const addDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    // Extract fields from request body
    const { countryCode, phoneNumber, donorName, address, purpose, amount, aadhar, pan, paymentMethod, donationCategory, donationDate, } = req.body;
    let message = "Message sent Successfully";
    const validationError = (0, helperFunction_1.validateDonationInput)({
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
    const lastDonationPromise = await prismaObject_1.default.donation.findFirst({
        orderBy: { id: "desc" },
        select: { receiptNo: true }, // select only needed field for performance
    });
    const receiptNo = (0, helperFunction_1.receiptNoGenerator)(lastDonationPromise ? lastDonationPromise.receiptNo : "", "M");
    // const receiptNo = lastDonation ? lastDonation.receiptNo + 1 : 1; // Increment receipt number or start with 1
    // Create a new donation record
    const donation = await prismaObject_1.default.donation.create({
        data: {
            receiptNo,
            authorizedPersonName: user.name,
            authorizedPersonId: user.id,
            donorName,
            date: new Date(donationDate),
            countryCode,
            aadhar: String(aadhar),
            pan: String(pan),
            phoneNumber: String(phoneNumber),
            address,
            amount: Number(amount),
            purpose,
            paymentMethod,
            donationCategory: types_1.DonationCategory[donationCategory] ||
                donationCategory,
        },
    });
    if (!donation) {
        return res
            .status(500) // Internal Server Error - database operation failed
            .json(new ApiResponse_1.ApiResponse(500, null, "Failed to create donation record"));
    }
    // Send invoice link
    await (0, sendingSMS_1.sendMessage)(`Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_MONEY}=${donation.id}`, countryCode + phoneNumber).catch((err) => {
        message = "Message sending failed";
        console.error("Message sending failed:", err);
    });
    // Respond with the created donation record
    return res
        .status(201) // Created - successful resource creation
        .json(new ApiResponse_1.ApiResponse(201, donation, `Donation recorded successfully, ${message}`));
});
exports.addDonation = addDonation;
// ADD DONATION
const addDonationIMPS = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    // Extract fields from request body
    const { purpose, amount, paymentMethod, donationDate } = req.body;
    console.log(amount);
    const validationError = (0, helperFunction_1.validateDonationInputIMPS)({
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
    const lastDonationPromise = await prismaObject_1.default.donation.findFirst({
        orderBy: { id: "desc" },
        select: { receiptNo: true }, // select only needed field for performance
    });
    const receiptNo = (0, helperFunction_1.receiptNoGenerator)(lastDonationPromise ? lastDonationPromise.receiptNo : "", "M");
    // const receiptNo = lastDonation ? lastDonation.receiptNo + 1 : 1; // Increment receipt number or start with 1
    // Create a new donation record
    const donation = await prismaObject_1.default.donation.create({
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
            .json(new ApiResponse_1.ApiResponse(500, null, "Failed to create donation record"));
    }
    // Respond with the created donation record
    return res
        .status(201) // Created - successful resource creation
        .json(new ApiResponse_1.ApiResponse(201, donation, `Donation recorded successfully`));
});
exports.addDonationIMPS = addDonationIMPS;
// Edit DONATION
//////////////////////////////////////////////////////////////////
const editDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    // Extract fields from request body
    const { donationId, address, donorName, aadhar, countryCode, pan, phoneNumber, amount, purpose, paymentMethod, donationCategory, donationDate, } = req.body;
    let message = "Message sent Successfully";
    if (!donationId) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, {}, "Donation ID is required"));
    }
    const validationError = (0, helperFunction_1.validateDonationInput)({
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
    const updatedDonation = await prismaObject_1.default.donation.update({
        where: { id: Number(donationId) },
        data: {
            authorizedPersonName: user.name,
            authorizedPersonId: user.id,
            donorName,
            date: new Date(donationDate),
            aadhar,
            countryCode,
            pan,
            phoneNumber,
            address,
            amount: Number(amount),
            purpose,
            paymentMethod,
            donationCategory: types_1.DonationCategory[donationCategory] ||
                donationCategory,
        },
        // select: { id: true },
    });
    if (!updatedDonation) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, {}, "Donation not found"));
    }
    // Send invoice link asynchronously (doesn't delay response)
    await (0, sendingSMS_1.sendMessage)(`Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_MONEY}=${donationId}`, countryCode + phoneNumber).catch((err) => {
        message = "Message sending failed";
        console.error("Message sending failed:", err);
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, {}, `Donation updated successfully,${message}`));
});
exports.editDonation = editDonation;
////////////////////////////////////////////////////////////////////////////
const getPaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
// GET DONATION LIST
const getDonationList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Extract pagination parameters with defaults
    const { page, limit, skip } = getPaginationParams(req.query);
    // Parallel DB calls: count + fetch donations
    const [totalDonations, donations] = await Promise.all([
        prismaObject_1.default.donation.count(),
        prismaObject_1.default.donation.findMany({
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonations,
            hasMore,
        },
    }, donations.length
        ? "Donations retrieved successfully"
        : "No donations available"));
});
exports.getDonationList = getDonationList;
//////////////////////////////////////////////////////////////////////
const searchDonorByDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    // Validate search parameter
    if (!search || typeof search !== "string" || !search.trim()) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid search term (Aadhar, mobile number, or name)"));
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
        prismaObject_1.default.donation.count({ where: whereClause }),
        prismaObject_1.default.donation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonors,
            hasMore,
        },
        searchTerm,
    }, donations.length
        ? "Donor records fetched successfully"
        : "No donor records found for the given search term"));
});
exports.searchDonorByDetails = searchDonorByDetails;
/////////////////////////////////////////////////////////////////
const filterDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentMethod = "", donationCategory = "" } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    if (paymentMethod == "" && donationCategory == "") {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter"));
    }
    // Validate search parameter by donation category]
    if (!(donationCategory in types_1.DonationCategory) &&
        donationCategory != "") {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter (SCHOOL,MEMBERSHIP,LUNCH,IN_KIND,LAND_AND_BUILDING,OTHER)"));
    }
    if (!(paymentMethod in types_1.PaymentMethod) && paymentMethod != "") {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter (UPI,DD,CASH,CHEQUE)"));
    }
    // Build the where clause dynamically
    const whereClause = {
        AND: [
            {
                OR: [
                    {
                        donationCategory: {
                            startsWith: types_1.DonationCategory[donationCategory],
                        },
                    },
                    // { donationCategory: { startsWith: "OTHER" } },
                ],
            },
            {
                paymentMethod: {
                    startsWith: paymentMethod,
                },
            },
        ],
    };
    // Get total count for pagination
    const [totalDonors, donations] = await Promise.all([
        prismaObject_1.default.donation.count({ where: whereClause }),
        prismaObject_1.default.donation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonors,
            hasMore,
        },
    }, donations.length
        ? "Donor records fetched successfully"
        : "No donor records found for the given filters"));
});
exports.filterDonation = filterDonation;
///////////////////////////////////////////////////////////////
const searchDonationsByDate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    // Validate date parameters
    if (!startDate || !endDate) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Both startDate and endDate are required (format: YYYY-MM-DD)"));
    }
    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Invalid date format. Please use YYYY-MM-DD format"));
    }
    if (start > end) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Start date must be earlier than or equal to end date"));
    }
    const whereClause = {
        date: {
            gte: start,
            lte: end,
        },
    };
    // 🧠 Parallel DB calls using Promise.all
    const [donations, totalDonations] = await Promise.all([
        prismaObject_1.default.donation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
                donorName: true,
                phoneNumber: true,
                aadhar: true,
                pan: true,
                paymentMethod: true,
                amount: true,
            },
        }),
        prismaObject_1.default.donation.count({ where: whereClause }),
    ]);
    const totalPages = Math.ceil(totalDonations / limit);
    const hasMore = page < totalPages;
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonations,
            hasMore,
        },
        dateRange: { startDate, endDate },
    }, donations.length === 0
        ? "No donations found for the given date range"
        : "Donations fetched successfully"));
});
exports.searchDonationsByDate = searchDonationsByDate;
//////////////////////////////////////////////////////////////////
const searchDonationsByDateForExcel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    // const { page, limit, skip } = getPaginationParams(req.query);
    // Validate date parameters
    if (!startDate || !endDate) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Both startDate and endDate are required (format: YYYY-MM-DD)"));
    }
    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Invalid date format. Please use YYYY-MM-DD format"));
    }
    if (start > end) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Start date must be earlier than or equal to end date"));
    }
    const whereClause = {
        date: {
            gte: start,
            lte: end,
        },
    };
    // 🧠 Parallel DB calls using Promise.all
    const [donations, totalDonations] = await Promise.all([
        prismaObject_1.default.$queryRaw `
        SELECT 
          receiptNo,
          authorizedPersonName,
          DATE_FORMAT(date, '%d/%m/%Y') as date,
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
        prismaObject_1.default.donation.count({ where: whereClause }),
    ]);
    // const totalPages = Math.ceil(totalDonations / limit);
    // const hasMore = page < totalPages;
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: totalDonations,
            hasMore: false,
        },
        dateRange: { startDate, endDate },
    }, donations.length === 0
        ? "No donations found for the given date range"
        : "Donations fetched successfully"));
});
exports.searchDonationsByDateForExcel = searchDonationsByDateForExcel;
////////////////////////////////////////////////////////
const calculateDonationsByDate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    // const { page, limit, skip } = getPaginationParams(req.query);
    // Validate date parameters
    if (!startDate || !endDate) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Both startDate and endDate are required (format: YYYY-MM-DD)"));
    }
    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Invalid date format. Please use YYYY-MM-DD format"));
    }
    if (start > end) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Start date must be earlier than or equal to end date"));
    }
    const whereClause = {
        date: {
            gte: start,
            lte: end,
        },
    };
    // Query the database with pagination
    const { _sum } = await prismaObject_1.default.donation.aggregate({
        where: whereClause,
        _sum: {
            amount: true,
        },
    });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        totalDonations: _sum.amount ?? 0,
        dateRange: { startDate: startDate, endDate: endDate },
    }, _sum.amount
        ? "Donations fetched successfully"
        : "No donations found for the given date range"));
});
exports.calculateDonationsByDate = calculateDonationsByDate;
////////////////////////////////////////////////////////
// GET DONATION BY ID
const getDonationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const donation = await prismaObject_1.default.donation.findUnique({
        where: { id: Number(id) },
    });
    if (!donation) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, {}, "Donation not found"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, donation, "Donation retrieved successfully"));
});
exports.getDonationById = getDonationById;
// kinds donation starts form here
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// ADD DONATION kinds
const addDonationKinds = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    // Extract fields from request body
    const { address, donorName, items, aadhar, countryCode, pan, phoneNumber, purpose, donationCategory, donationDate, } = req.body;
    let message = "Message sent Successfully";
    const validationError = (0, helperFunction_1.validateDonationInput)({
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
    const filterItems = (0, helperFunction_1.filteredMissingFieldsObjectFromItems)(items);
    // Generate receipt number
    const lastDonation = await prismaObject_1.default.donationKinds.findFirst({
        orderBy: { id: "desc" },
    });
    const receiptNo = (0, helperFunction_1.receiptNoGenerator)(lastDonation ? lastDonation.receiptNo : "", "K");
    // Create a new donation record
    const donation = await prismaObject_1.default.donationKinds.create({
        data: {
            receiptNo,
            authorizedPersonName: user.name,
            authorizedPersonId: user.id,
            donorName,
            countryCode,
            date: new Date(donationDate),
            aadhar: String(aadhar),
            pan: String(pan),
            phoneNumber: String(phoneNumber),
            address,
            purpose,
            donationCategory: types_1.DonationCategory[donationCategory] ||
                donationCategory,
            items: filterItems
                ? {
                    create: filterItems.map((item) => ({
                        name: item.name,
                        quantity: String(item.quantity),
                        approxAmount: +item.approxAmount,
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
            .json(new ApiResponse_1.ApiResponse(500, null, "Failed to create donation record"));
    }
    // Send invoice link
    await (0, sendingSMS_1.sendMessage)(`Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_KIND}=${donation.id}`, countryCode + phoneNumber).catch((err) => {
        message = "Message sending failed";
        console.error("Message sending failed:", err);
    });
    // Respond with the created donation record
    return res
        .status(201) // Created - successful resource creation
        .json(new ApiResponse_1.ApiResponse(201, donation, `Donation recorded successfully, ${message}`));
});
exports.addDonationKinds = addDonationKinds;
// edit kind donation
////////////////////////////////////////////////////////////
const editKindDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    // Extract fields from request body
    const { donationId, address, donorName, aadhar, countryCode, pan, items, phoneNumber, purpose, donationCategory, donationDate, } = req.body;
    let message = "Message sent Successfully";
    if (!donationId) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, {}, "Donation ID is required"));
    }
    const validationError = (0, helperFunction_1.validateDonationInput)({
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
    const filterItems = (0, helperFunction_1.filteredMissingFieldsObjectFromItems)(items);
    // Create a new donation record
    const updatedDonation = await prismaObject_1.default.donationKinds.update({
        where: { id: Number(donationId) },
        data: {
            authorizedPersonName: user.name,
            authorizedPersonId: user.id,
            donorName,
            countryCode,
            date: new Date(donationDate),
            aadhar: String(aadhar),
            pan: String(pan),
            phoneNumber: String(phoneNumber),
            address,
            purpose,
            donationCategory: types_1.DonationCategory[donationCategory] ||
                donationCategory,
            items: filterItems
                ? {
                    deleteMany: { donationId: Number(donationId) },
                    create: filterItems.map((item) => ({
                        name: item.name,
                        quantity: String(item.quantity),
                        approxAmount: +item.approxAmount,
                    })),
                }
                : undefined,
        },
    });
    if (!updatedDonation) {
        return res
            .status(504)
            .json(new ApiResponse_1.ApiResponse(504, {}, "Failed to update donation"));
    }
    // Send invoice link asynchronously (doesn't delay response)
    await (0, sendingSMS_1.sendMessage)(`Download your donation receipt:${process.env.DOWNLOAD_RECEIPT_URL_KIND}=${donationId}`, countryCode + phoneNumber).catch((err) => {
        message = "Message sending failed";
        console.error("Message sending failed:", err);
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, {}, `Donation updated successfully, ${message}`));
});
exports.editKindDonation = editKindDonation;
//////////////////////////////////////////////////////////////////////////////////////
// GET kinds DONATION LIST
const getDonationKindsList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Extract pagination parameters with defaults
    const { page, limit, skip } = getPaginationParams(req.query);
    // Use Promise.all to parallelize count and findMany
    const [totalItems, donations] = await Promise.all([
        prismaObject_1.default.donationKinds.count(),
        prismaObject_1.default.donationKinds.findMany({
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
        },
    }, donations.length
        ? "Donations retrieved successfully"
        : "No donations available"));
});
exports.getDonationKindsList = getDonationKindsList;
//////////////////////////////////////////////////////////
// kinds Donation search list
const searchKindsDonorByDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    // Validate search parameter
    if (!search || typeof search !== "string" || !search.trim()) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid search term (Aadhar, mobile number, or name)"));
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
        prismaObject_1.default.donationKinds.count({ where: whereClause }),
        prismaObject_1.default.donationKinds.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
        },
        searchTerm,
    }, donations.length
        ? "Donor records fetched successfully"
        : "No donor records found for the given search term"));
});
exports.searchKindsDonorByDetails = searchKindsDonorByDetails;
///////////////////////////////////////////////////////////////
// filter kind donations
const filterKindsDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentMethod = "", donationCategory = "" } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    if (!paymentMethod && !donationCategory) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter"));
    }
    // Validate search parameter by donation category]
    if (!(donationCategory in types_1.DonationCategory) &&
        donationCategory != "") {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter (SCHOOL_HOSTEL_OPERATIONS,LIFETIME_MEMBERSHIP,LIFETIME_LUNCH,IN_KIND,LAND_AND_BUILDING,OTHER)"));
    }
    if (!(paymentMethod in types_1.PaymentMethod) && paymentMethod != "") {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter (UPI,DD,CASH,CHEQUE)"));
    }
    // Build the where clause dynamically
    const whereClause = {
        AND: [
            {
                OR: [
                    { donationCategory: donationCategory },
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
        prismaObject_1.default.donationKinds.count({ where: whereClause }),
        prismaObject_1.default.donationKinds.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
        },
    }, donations.length
        ? "Filtered donor records fetched successfully"
        : "No donor records found for the given filter"));
});
exports.filterKindsDonation = filterKindsDonation;
///////////////////////////////////////////////////////////
// search kinds donation
const searchKindsDonationsByDate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    // Validate date parameters
    if (!startDate || !endDate) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Both startDate and endDate are required (format: YYYY-MM-DD)"));
    }
    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Invalid date format. Please use YYYY-MM-DD format"));
    }
    if (start > end) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Start date must be earlier than or equal to end date"));
    }
    const whereClause = {
        date: {
            gte: start,
            lte: end,
        },
    };
    // Execute count and query in parallel
    const [totalItems, donations] = await Promise.all([
        prismaObject_1.default.donationKinds.count({ where: whereClause }),
        prismaObject_1.default.donationKinds.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            select: {
                id: true,
                receiptNo: true,
                authorizedPersonName: true,
                date: true,
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
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasMore,
        },
        dateRange: { startDate, endDate },
    }, donations.length
        ? "Donations fetched successfully"
        : "No donations found for the given date range"));
});
exports.searchKindsDonationsByDate = searchKindsDonationsByDate;
// search kinds donation
const searchKindsDonationsByDateExcel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    // Validate date parameters
    if (!startDate || !endDate) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Both startDate and endDate are required (format: YYYY-MM-DD)"));
    }
    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Invalid date format. Please use YYYY-MM-DD format"));
    }
    if (start > end) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Start date must be earlier than or equal to end date"));
    }
    const whereClause = {
        date: {
            gte: start,
            lte: end,
        },
    };
    // Execute count and query in parallel
    const [totalItems, donations] = await Promise.all([
        prismaObject_1.default.donationKinds.count({ where: whereClause }),
        prismaObject_1.default.$queryRaw `
        SELECT 
          dk.receiptNo,
          dk.authorizedPersonName,
          DATE_FORMAT(dk.date, '%d/%m/%Y') as date,
          dk.donorName,
          dk.phoneNumber,
          dk.aadhar,
          dk.pan,
          dk.purpose,
          dk.donationCategory,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'name', i.name,
              'quantity', i.quantity,
              'approxAmount', i.approxAmount
            )
          ) as items
        FROM DonationKinds dk
        LEFT JOIN Item i ON dk.id = i.donationId
        WHERE dk.date >= ${start} AND dk.date <= ${end}
        GROUP BY dk.id, dk.receiptNo, dk.authorizedPersonName, dk.date, dk.donorName, dk.phoneNumber, dk.aadhar, dk.pan, dk.purpose, dk.donationCategory
        ORDER BY dk.id DESC
      `,
    ]);
    // console.log(donations);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems,
            hasMore: false,
        },
        dateRange: { startDate, endDate },
    }, donations.length
        ? "Donations fetched successfully"
        : "No donations found for the given date range"));
});
exports.searchKindsDonationsByDateExcel = searchKindsDonationsByDateExcel;
/////////////////////////////////////////////////////////
// GET DONATION BY ID
const getKindsDonationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const donation = await prismaObject_1.default.donationKinds.findUnique({
        where: { id: Number(id) },
        include: {
            items: true, // Include related items for item donations
        },
    });
    if (!donation) {
        return res
            .status(404)
            .json(new ApiResponse_1.ApiResponse(404, {}, "Donation not found"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, donation, "Donation retrieved successfully"));
});
exports.getKindsDonationById = getKindsDonationById;
const sendMessageOnMobile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { number } = req.params;
    await (0, sendingSMS_1.sendMessage)("Thank you for contacting Anubhuti vision seva sansthan, an organization that has been working for disabled children for over 15 years. We warmly invite you to visit us, bless us with your presence, guide us with your wisdom, and support us in our mission for humanity.", number).catch((err) => {
        "Message sending failed";
        console.error("Message sending failed:", err);
    });
});
exports.sendMessageOnMobile = sendMessageOnMobile;
//# sourceMappingURL=donation.controllers.js.map