"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRouter = void 0;
const express_1 = require("express");
const invoice_controllers_1 = require("../controllers/invoice.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const invoiceRouter = (0, express_1.Router)();
exports.invoiceRouter = invoiceRouter;
invoiceRouter.route("/invoice").get(auth_middleware_1.verifyJWT, invoice_controllers_1.viewInvoice);
invoiceRouter.route("/invoiceKind").get(auth_middleware_1.verifyJWT, invoice_controllers_1.viewkindInvoice);
invoiceRouter.route("/downloadInvoice").get(invoice_controllers_1.DownloadInvoice);
invoiceRouter.route("/downloadKindsInvoice").get(invoice_controllers_1.DownloadKindsInvoice);
//# sourceMappingURL=invoice.route.js.map