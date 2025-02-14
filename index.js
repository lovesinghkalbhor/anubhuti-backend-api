"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use((0, cookie_parser_1.default)());
app.set("view engine", "ejs");
// Start the server
const user_routes_1 = require("./routes/user.routes");
const donations_routes_1 = require("./routes/donations.routes");
const invoice_route_1 = require("./routes/invoice.route");
const ApiErrors_1 = require("./utils/ApiErrors");
app.use("/api/v1/users", user_routes_1.userRouter);
app.use("/api/v1/donations", donations_routes_1.donationRouter);
app.use("/api/v1/viewInvoice", invoice_route_1.invoiceRouter);
// Error handling middleware (defined AFTER all other routes)
app.use((err, req, res, next) => {
    console.error("Error caught by middleware:", err.stack); // Log the error stack
    (0, ApiErrors_1.errorHandler)(err, req, res, next);
});
// Create HTTP Server (Same as app.js)
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map