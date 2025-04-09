import { Router } from "express";
import {
  DownloadInvoice,
  DownloadInvoiceMobile,
  DownloadKindsInvoice,
  DownloadKindsInvoiceMobile,
  viewInvoice,
  viewkindInvoice,
} from "../controllers/invoice.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
const invoiceRouter = Router();

invoiceRouter.route("/invoice").get(verifyJWT, viewInvoice);
invoiceRouter.route("/invoiceKind").get(verifyJWT, viewkindInvoice);
invoiceRouter.route("/downloadInvoice").get(DownloadInvoice);
invoiceRouter.route("/downloadKindsInvoice").get(DownloadKindsInvoice);
invoiceRouter.route("/downloadInvoice-message").get(DownloadInvoiceMobile);
invoiceRouter
  .route("/downloadKindsInvoice-message")
  .get(DownloadKindsInvoiceMobile);

export { invoiceRouter };
