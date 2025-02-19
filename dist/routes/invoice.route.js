"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRouter = void 0;
const express_1 = require("express");
const invoice_controllers_1 = require("../controllers/invoice.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const invoice_controllers_2 = require("../controllers/invoice.controllers");
const invoiceRouter = (0, express_1.Router)();
exports.invoiceRouter = invoiceRouter;
invoiceRouter.route("/invoice").get(auth_middleware_1.verifyJWT, invoice_controllers_1.viewInvoice);
invoiceRouter.route("/downloadInvoice").get(invoice_controllers_2.DownloadInvoice);
//# sourceMappingURL=invoice.route.js.map