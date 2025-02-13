import { Router } from "express";
import {
  searchDonationsByDate,
  addDonation,
  getDonationList,
  searchDonorByDetails,
  getDonationById,
  calculateDonationsByDate,
  filterDonation,
} from "../controllers/donation.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
const donationRouter = Router();

donationRouter.route("/addDonation").post(verifyJWT, addDonation);
donationRouter.route("/getDonation").get(verifyJWT, getDonationList);
donationRouter.route("/getDonation/:id").get(verifyJWT, getDonationById);
donationRouter.route("/search").get(verifyJWT, searchDonorByDetails);
donationRouter.route("/filterByDate").get(verifyJWT, searchDonationsByDate);
donationRouter
  .route("/calculateDonationsByDate")
  .get(verifyJWT, calculateDonationsByDate);

donationRouter.route("/filter").get(verifyJWT, filterDonation);
// userRouter.post("/donations/add", verifyJWT, addDonation);

export { donationRouter };
