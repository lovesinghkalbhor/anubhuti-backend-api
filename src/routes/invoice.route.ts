import { Router } from "express";
import {
  DownloadInvoice,
  viewInvoice,
} from "../controllers/invoice.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
const invoiceRouter = Router();

invoiceRouter.route("/invoice").get(verifyJWT, viewInvoice);
invoiceRouter.route("/downloadInvoice").get(DownloadInvoice);

export { invoiceRouter };
