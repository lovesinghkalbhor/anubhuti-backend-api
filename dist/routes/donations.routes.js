"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationRouter = void 0;
const express_1 = require("express");
const donation_controllers_1 = require("../controllers/donation.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const donationRouter = (0, express_1.Router)();
exports.donationRouter = donationRouter;
donationRouter.route("/addDonation").post(auth_middleware_1.verifyJWT, donation_controllers_1.addDonation);
donationRouter.route("/getDonation").get(auth_middleware_1.verifyJWT, donation_controllers_1.getDonationList);
donationRouter.route("/getDonation/:id").get(auth_middleware_1.verifyJWT, donation_controllers_1.getDonationById);
donationRouter.route("/search").get(auth_middleware_1.verifyJWT, donation_controllers_1.searchDonorByDetails);
donationRouter.route("/filterByDate").get(auth_middleware_1.verifyJWT, donation_controllers_1.searchDonationsByDate);
donationRouter
    .route("/calculateDonationsByDate")
    .get(auth_middleware_1.verifyJWT, donation_controllers_1.calculateDonationsByDate);
donationRouter.route("/filter").get(auth_middleware_1.verifyJWT, donation_controllers_1.filterDonation);
//# sourceMappingURL=donations.routes.js.map