"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDonationInput = exports.filteredMissingFieldsObjectFromItems = void 0;
exports.receiptNoGenerator = receiptNoGenerator;
exports.numberToWords = numberToWords;
const types_1 = require("../types/types");
const ApiResponse_1 = require("../utils/ApiResponse");
const validateDonationInput = ({ countryCode, phoneNumber, donorName, address, purpose, amount = 0, aadhar, pan, donationCategory = "", paymentMethod = "", donationType = "", items = [], }) => {
    // Validate items structure
    if (donationType == "kind") {
        if (!Array.isArray(items)) {
            return new ApiResponse_1.ApiResponse(422, null, "Items must be provided as an array");
        }
        if (!items.length) {
            return new ApiResponse_1.ApiResponse(422, null, "Donation can not be empty");
        }
    }
    else {
        if (!amount && Number(amount) <= 0) {
            return new ApiResponse_1.ApiResponse(422, null, "Amount must be a positive number");
        }
        if (!(paymentMethod in types_1.PaymentMethod) &&
            !paymentMethod?.startsWith("DD") &&
            !paymentMethod?.startsWith("CHEQUE") &&
            !paymentMethod?.startsWith("UPI")) {
            return new ApiResponse_1.ApiResponse(400, null, "Invalid payment method. Valid options: CASH, UPI, DD, CHEQUE");
        }
        if (paymentMethod?.startsWith("DD")) {
            const ddNumber = paymentMethod.split("-")[1];
            if (!/^\d+$/.test(ddNumber)) {
                return new ApiResponse_1.ApiResponse(400, null, "Invalid DD number");
            }
        }
    }
    if (!countryCode || !phoneNumber) {
        return new ApiResponse_1.ApiResponse(400, null, "Kindly enter the correct phone number including the country code");
    }
    if (!address || !donorName || !purpose?.trim()) {
        return new ApiResponse_1.ApiResponse(422, null, "Required fields missing: donor name, address, and purpose are mandatory");
    }
    if (!aadhar && !pan) {
        return new ApiResponse_1.ApiResponse(422, null, "Either Aadhar or PAN number is required for donation");
    }
    if (!(donationCategory in types_1.DonationCategory) &&
        !donationCategory?.startsWith("OTHER")) {
        return new ApiResponse_1.ApiResponse(400, "", "Donation Category must be valid: SCHOOL_HOSTEL_OPERATIONS, LIFETIME_MEMBERSHIP, LIFETIME_LUNCH, IN_KIND, LAND_AND_BUILDING, OTHER");
    }
    return null; // everything is valid
};
exports.validateDonationInput = validateDonationInput;
function numberToWords(num) {
    if (num === 0)
        return "zero";
    const belowTwenty = [
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
    ];
    const tens = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
    ];
    const thousands = ["", "thousand", "million", "billion"];
    let word = "";
    let i = 0;
    function helper(n) {
        if (n === 0)
            return "";
        else if (n < 20)
            return belowTwenty[n - 1] + " ";
        else if (n < 100)
            return tens[Math.floor(n / 10)] + " " + helper(n % 10);
        else
            return (belowTwenty[Math.floor(n / 100) - 1] + " hundred " + helper(n % 100));
    }
    while (num > 0) {
        if (num % 1000 !== 0) {
            word = helper(num % 1000) + thousands[i] + " " + word;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return word.trim();
}
const filteredMissingFieldsObjectFromItems = (items) => {
    const itemsArray = items.filter((item) => {
        const isNameEmpty = String(item.name).trim();
        const isQuantityEmpty = String(item.quantity).trim();
        const isApproxamount = +item.approxAmount >= 0;
        // If one of the fields is empty, show notification and exit
        if (!isNameEmpty || !isQuantityEmpty || !isApproxamount) {
            return false; // This ensures we skip processing further
        }
        else {
            return true; // This ensures we skip processing further
        }
    });
    return itemsArray;
};
exports.filteredMissingFieldsObjectFromItems = filteredMissingFieldsObjectFromItems;
function receiptNoGenerator(lastDonation, donationType) {
    let lastNumber = 0;
    if (lastDonation) {
        let match;
        if (donationType === "M") {
            match = lastDonation.match(/^(\d+)M/);
        }
        else if (donationType === "K") {
            match = lastDonation.match(/^(\d+)K/);
        }
        if (match) {
            lastNumber = parseInt(match[1]);
        }
    }
    const newNumber = lastNumber + 1;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;
    const financialYear = `${startYear}/${endYear}`;
    const receiptNo = `${newNumber}${donationType}-${financialYear}`;
    return receiptNo;
}
//# sourceMappingURL=helperFunction.js.map