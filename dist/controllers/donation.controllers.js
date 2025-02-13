"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDonation = exports.calculateDonationsByDate = exports.searchDonationsByDate = exports.searchDonorByDetails = exports.getDonationById = exports.addDonation = exports.getDonationList = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const prismaObject_1 = __importDefault(require("../utils/prismaObject"));
const sendingSMS_1 = require("../utils/sendingSMS");
const helperFunction_1 = require("../utils/helperFunction");
const types_1 = require("../types/types");
////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// ADD DONATION
const addDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    // console.log(user);
    // Extract fields from request body
    const { address, donorName, items, aadhar, pan, phoneNumber, amount, purpose, paymentMethod, donationCategory, } = req.body;
    // Validate basic required fields
    if (!address || !donorName || !purpose?.trim()) {
        return res
            .status(422) // Unprocessable Entity - better for validation errors
            .json(new ApiResponse_1.ApiResponse(422, null, "Required fields missing: donor name, address, and purpose are mandatory"));
    }
    // Validate amount if provided
    if ((!items || !items.length) &&
        amount !== undefined &&
        (isNaN(amount) || amount <= 0)) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Amount must be a positive number"));
    }
    // Validate items structure
    if (items && !Array.isArray(items)) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Items must be provided as an array"));
    }
    // Validate donation content
    if (!amount && (!items || items.length === 0)) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Either monetary amount or items must be provided for donation"));
    }
    // Validate identification documents
    if (!aadhar && !pan) {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Either Aadhar or PAN number is required for donation"));
    }
    if (!Array.isArray(items)) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, "", "items should be an array"));
    }
    // check if donationCategory is valid
    if (!(donationCategory in types_1.DonationCategory)) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, "", "Donation Category must be valid, SCHOOL_HOSTEL_OPERATIONS, LIFETIME_MEMBERSHIP,LIFETIME_LUNCH, IN_KIND, LAND_AND_BUILDING, OTHER"));
    }
    // CHECK correct payment method
    if (!(paymentMethod in types_1.PaymentMethod) && !paymentMethod.startsWith("DD")) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, null, "Invalid payment method, Valid payment methods: CASH, UPI, DD, CHEQUE"));
    }
    if (paymentMethod.startsWith("DD")) {
        const ddNumber = paymentMethod.split("-")[1]; // Extract the number part
        if (!/^\d+$/.test(ddNumber)) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponse(400, null, "Invalid DD number"));
        }
    }
    // fileter the valid item in kind
    const filterItems = (0, helperFunction_1.filteredMissingFieldsObjectFromItems)(items);
    // Generate receipt number
    const lastDonation = await prismaObject_1.default.donation.findFirst({
        orderBy: { receiptNo: "desc" },
    });
    const receiptNo = lastDonation ? lastDonation.receiptNo + 1 : 1; // Increment receipt number or start with 1
    // Create a new donation record
    const donation = await prismaObject_1.default.donation.create({
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
            paymentMethod,
            donationCategory: types_1.DonationCategory[donationCategory],
            items: filterItems
                ? {
                    create: filterItems.map((item) => ({
                        name: item.name,
                        quantity: String(item.quantity),
                        approxAmount: item.approxAmount,
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
    await (0, sendingSMS_1.sendMessage)(`Download your donation receipt: http://localhost:3000/api/v1/viewInvoice/downloadInvoice?receiptNo=${donation.receiptNo}`);
    // Respond with the created donation record
    return res
        .status(201) // Created - successful resource creation
        .json(new ApiResponse_1.ApiResponse(201, donation, "Donation recorded successfully. Receipt has been sent."));
});
exports.addDonation = addDonation;
////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
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
    // Get total count for pagination
    const totalDonations = await prismaObject_1.default.donation.count();
    // Get paginated donations
    const donations = await prismaObject_1.default.donation.findMany({
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
            .json(new ApiResponse_1.ApiResponse(200, {
            donations: [],
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalDonations,
                hasMore: false,
            },
        }, "No donations available"));
    }
    // Successful response with data
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonations,
            hasMore,
        },
    }, "Donations retrieved successfully"));
});
exports.getDonationList = getDonationList;
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
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
        ],
    };
    // Get total count for pagination
    const totalDonors = await prismaObject_1.default.donation.count({
        where: whereClause,
    });
    console.log(skip, limit, page);
    // Query the database with pagination
    const donations = await prismaObject_1.default.donation.findMany({
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
    console.log(donations);
    const totalPages = Math.ceil(totalDonors / limit);
    const hasMore = page < totalPages;
    // No results found
    if (donations.length === 0) {
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            donations: [],
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalDonors,
                hasMore: false,
            },
            searchTerm,
        }, "No donor records found for the given search term"));
    }
    // Success response
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonors,
            hasMore,
        },
        searchTerm,
    }, "Donor records fetched successfully"));
});
exports.searchDonorByDetails = searchDonorByDetails;
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
const filterDonation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentMethod = "", donationCategory = "" } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    if (paymentMethod == "" && donationCategory == "") {
        return res
            .status(422)
            .json(new ApiResponse_1.ApiResponse(422, null, "Please provide a valid filter"));
    }
    // Validate search parameter by donation category]
    console.log(donationCategory);
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
                donationCategory: types_1.DonationCategory[donationCategory.trim()],
            },
            {
                paymentMethod: types_1.PaymentMethod[paymentMethod.trim()],
            },
        ],
    };
    // Get total count for pagination
    const totalDonors = await prismaObject_1.default.donation.count({
        where: whereClause,
    });
    // Query the database with pagination
    const donations = await prismaObject_1.default.donation.findMany({
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
    const totalPages = Math.ceil(totalDonors / limit);
    const hasMore = page < totalPages;
    // No results found
    if (donations.length === 0) {
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            donations: [],
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalDonors,
                hasMore: false,
            },
        }, "No donor records found for the given search term"));
    }
    // Success response
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonors,
            hasMore,
        },
    }, "Donor records fetched successfully"));
});
exports.filterDonation = filterDonation;
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
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
    // Get total count for pagination
    const totalDonations = await prismaObject_1.default.donation.count({
        where: whereClause,
    });
    // Query the database with pagination
    const donations = await prismaObject_1.default.donation.findMany({
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
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            donations: [],
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalDonations,
                hasMore: false,
            },
            dateRange: { startDate, endDate },
        }, "No donations found for the given date range"));
    }
    // Success response
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        donations,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalDonations,
            hasMore,
        },
        dateRange: { startDate, endDate },
    }, "Donations fetched successfully"));
});
exports.searchDonationsByDate = searchDonationsByDate;
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
    const donations = await prismaObject_1.default.donation.aggregate({
        where: whereClause,
        _sum: {
            amount: true,
        },
    });
    // No results found
    if (!donations) {
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            totalDonations: null,
            dateRange: { startDate, endDate },
        }, "No donations found for the given date range"));
    }
    // Success response
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        totalDonations: donations?._sum?.amount ?? null,
        dateRange: { startDate, endDate },
    }, "Donations fetched successfully"));
});
exports.calculateDonationsByDate = calculateDonationsByDate;
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
// GET DONATION BY ID
const getDonationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const donation = await prismaObject_1.default.donation.findUnique({
        where: { id: Number(id) },
        include: {
            items: true, // Include related items for item donations
        },
    });
    if (!donation) {
        return res
            .status(404)
            .json(new ApiResponse_1.ApiResponse(404, null, "Donation not found"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, donation, "Donation retrieved successfully"));
});
exports.getDonationById = getDonationById;
//# sourceMappingURL=donation.controllers.js.map