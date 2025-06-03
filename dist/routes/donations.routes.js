"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationRouter = void 0;
const express_1 = require("express");
const donation_controllers_1 = require("../controllers/donation.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const donationRouter = (0, express_1.Router)();
exports.donationRouter = donationRouter;
donationRouter.route("/addDonation").post(auth_middleware_1.verifyJWT, donation_controllers_1.addDonation);
donationRouter.route("/addDonationIMPS").post(auth_middleware_1.verifyJWT, donation_controllers_1.addDonationIMPS);
donationRouter.route("/editDonation").post(auth_middleware_1.verifyJWT, donation_controllers_1.editDonation);
donationRouter.route("/getDonation").get(auth_middleware_1.verifyJWT, donation_controllers_1.getDonationList);
donationRouter.route("/getDonation/:id").get(auth_middleware_1.verifyJWT, donation_controllers_1.getDonationById);
donationRouter.route("/search").get(auth_middleware_1.verifyJWT, donation_controllers_1.searchDonorByDetails);
donationRouter.route("/filterByDate").get(auth_middleware_1.verifyJWT, donation_controllers_1.searchDonationsByDate);
donationRouter
    .route("/getDonationByDate")
    .get(auth_middleware_1.verifyJWT, donation_controllers_1.searchDonationsByDateForExcel);
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
donationRouter.route("/addDonationKinds").post(auth_middleware_1.verifyJWT, donation_controllers_1.addDonationKinds);
donationRouter.route("/searchKinds").get(auth_middleware_1.verifyJWT, donation_controllers_1.searchKindsDonorByDetails);
donationRouter.route("/getDonationKinds").get(auth_middleware_1.verifyJWT, donation_controllers_1.getDonationKindsList);
donationRouter.route("/editKindDonation").post(auth_middleware_1.verifyJWT, donation_controllers_1.editKindDonation);
donationRouter
    .route("/getDonationKinds/:id")
    .get(auth_middleware_1.verifyJWT, donation_controllers_1.getKindsDonationById);
donationRouter.route("/filter").get(auth_middleware_1.verifyJWT, donation_controllers_1.filterDonation);
donationRouter
    .route("/filterKindsByDate")
    .get(auth_middleware_1.verifyJWT, donation_controllers_1.searchKindsDonationsByDate);
donationRouter
    .route("/getKindDonationByDate")
    .get(auth_middleware_1.verifyJWT, donation_controllers_1.searchKindsDonationsByDateExcel);
donationRouter
    .route("/calculateDonationsByDate")
    .get(auth_middleware_1.verifyJWT, donation_controllers_1.calculateDonationsByDate);
donationRouter.route("/filterKinds").get(auth_middleware_1.verifyJWT, donation_controllers_1.filterKindsDonation);
donationRouter.route("/sendMessageOnMobile").get(donation_controllers_1.sendMessageOnMobile);
//# sourceMappingURL=donations.routes.js.map