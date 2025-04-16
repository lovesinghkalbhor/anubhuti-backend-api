import { Router } from "express";
import {
  searchDonationsByDate,
  addDonation,
  getDonationList,
  searchDonorByDetails,
  getDonationById,
  calculateDonationsByDate,
  filterDonation,
  addDonationKinds,
  getDonationKindsList,
  getKindsDonationById,
  searchKindsDonorByDetails,
  filterKindsDonation,
  searchKindsDonationsByDate,
  editDonation,
  editKindDonation,
  searchDonationsByDateForExcel,
  searchKindsDonationsByDateExcel,
  sendMessageOnMobile,
} from "../controllers/donation.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
const donationRouter = Router();

donationRouter.route("/addDonation").post(verifyJWT, addDonation);
donationRouter.route("/editDonation").post(verifyJWT, editDonation);
donationRouter.route("/getDonation").get(verifyJWT, getDonationList);
donationRouter.route("/getDonation/:id").get(verifyJWT, getDonationById);
donationRouter.route("/search").get(verifyJWT, searchDonorByDetails);
donationRouter.route("/filterByDate").get(verifyJWT, searchDonationsByDate);
donationRouter
  .route("/getDonationByDate")
  .get(verifyJWT, searchDonationsByDateForExcel);

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

donationRouter.route("/addDonationKinds").post(verifyJWT, addDonationKinds);
donationRouter.route("/searchKinds").get(verifyJWT, searchKindsDonorByDetails);
donationRouter.route("/getDonationKinds").get(verifyJWT, getDonationKindsList);
donationRouter.route("/editKindDonation").post(verifyJWT, editKindDonation);
donationRouter
  .route("/getDonationKinds/:id")
  .get(verifyJWT, getKindsDonationById);
donationRouter.route("/filter").get(verifyJWT, filterDonation);
donationRouter
  .route("/filterKindsByDate")
  .get(verifyJWT, searchKindsDonationsByDate);
donationRouter
  .route("/getKindDonationByDate")
  .get(verifyJWT, searchKindsDonationsByDateExcel);

donationRouter
  .route("/calculateDonationsByDate")
  .get(verifyJWT, calculateDonationsByDate);
donationRouter.route("/filterKinds").get(verifyJWT, filterKindsDonation);
donationRouter.route("/sendMessageOnMobile").get(sendMessageOnMobile);

// userRouter.post("/donations/add", verifyJWT, addDonation);

export { donationRouter };
