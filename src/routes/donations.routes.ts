import { Router } from "express";
import {
  searchDonationsByDate,
  addDonation,
  getDonationList,
  searchDonorByDetails,
  getDonationById,
} from "../controllers/donation.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
const donationRouter = Router();

donationRouter.route("/addDonation").post(verifyJWT, addDonation);
donationRouter.route("/getDonation").get(verifyJWT, getDonationList);
donationRouter.route("/getDonation/:id").get(verifyJWT, getDonationById);
donationRouter.route("/search").get(verifyJWT, searchDonorByDetails);
donationRouter.route("/filterByDate").get(verifyJWT, searchDonationsByDate);

// userRouter.get("/donations", verifyJWT, getDonationList);
// userRouter.post("/donations/add", verifyJWT, addDonation);

export { donationRouter };
