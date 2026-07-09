import "dotenv/config";
import express from "express";
import cors from "cors";
import { attachClerk, requireSignedIn } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { customersRouter } from "./routes/customers.js";
import { insurersRouter } from "./routes/insurers.js";
import { servicesRouter } from "./routes/services.js";
import { invoicesRouter } from "./routes/invoices.js";
import { staffRouter } from "./routes/staff.js";
import { toursRouter } from "./routes/tours.js";
import { tasksRouter } from "./routes/tasks.js";
import { requestsRouter } from "./routes/requests.js";
import { dashboardRouter } from "./routes/dashboard.js";

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

const api = express.Router();
api.use(attachClerk, requireSignedIn);
api.use("/customers", customersRouter);
api.use("/insurers", insurersRouter);
api.use("/services", servicesRouter);
api.use("/invoices", invoicesRouter);
api.use("/staff", staffRouter);
api.use("/tours", toursRouter);
api.use("/tasks", tasksRouter);
api.use("/requests", requestsRouter);
api.use("/dashboard", dashboardRouter);
app.use("/api", api);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
