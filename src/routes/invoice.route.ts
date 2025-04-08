import { Router } from "express";
import {
  DownloadInvoice,
  DownloadKindsInvoice,
  viewInvoice,
  viewkindInvoice,
} from "../controllers/invoice.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
const invoiceRouter = Router();

invoiceRouter.route("/invoice").get(verifyJWT, viewInvoice);
invoiceRouter.route("/invoiceKind").get(verifyJWT, viewkindInvoice);
invoiceRouter.route("/downloadInvoice").get(DownloadInvoice);
invoiceRouter.route("/downloadKindsInvoice").get(DownloadKindsInvoice);

export { invoiceRouter };
