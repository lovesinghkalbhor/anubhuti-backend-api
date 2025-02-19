import { Router } from "express";
import { viewInvoice } from "../controllers/invoice.controllers";
import { verifyJWT } from "../middleware/auth.middleware";
import { DownloadInvoice } from "../controllers/invoice.controllers";
const invoiceRouter = Router();

invoiceRouter.route("/invoice").get(verifyJWT, viewInvoice);
invoiceRouter.route("/downloadInvoice").get(DownloadInvoice);

export { invoiceRouter };
