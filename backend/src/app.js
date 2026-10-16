 
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
 


const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notifications", notificationRoutes);
 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.statusCode && err.statusCode < 500
        ? err.message
        : "Internal server error",
  });
});

export default app;
