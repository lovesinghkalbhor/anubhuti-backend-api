"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.DonationCategory = void 0;
// modify the code such that all value will be string
var DonationCategory;
(function (DonationCategory) {
    DonationCategory["SCHOOL_HOSTEL_OPERATIONS"] = "Donation for operational activities of school and hostel";
    DonationCategory["LIFETIME_MEMBERSHIP"] = "Donation for Life time membership";
    DonationCategory["LIFETIME_LUNCH"] = "Donation for Life time lunch";
    DonationCategory["IN_KIND"] = "Donation in-kind";
    DonationCategory["LAND_AND_BUILDING"] = "Donation for Land and building";
    DonationCategory["OTHER"] = "Donation for Any other";
})(DonationCategory || (exports.DonationCategory = DonationCategory = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    // CHEQUE = "Cheque",
    // UPI = "UPI",
    // DD = "DD",
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
//# sourceMappingURL=types.js.map