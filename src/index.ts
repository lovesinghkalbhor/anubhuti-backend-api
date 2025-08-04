import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import { ApiResponse } from "./utils/ApiResponse";
import path from "path";
const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(cookieparser());
app.set("view engine", "ejs");

// Start the server
const PORT = process.env.PORT || 3000;

import { userRouter } from "./routes/user.routes";
import { donationRouter } from "./routes/donations.routes";
import { invoiceRouter } from "./routes/invoice.route";
import { errorHandler } from "./utils/ApiErrors";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/donations", donationRouter);
app.use("/api/v1/viewInvoice", invoiceRouter);

// Error handling middleware (defined AFTER all other routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error caught by middleware:", err.stack); // Log the error stack
  errorHandler(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { app };
