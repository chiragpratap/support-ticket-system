
import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { dashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", dashboardStats);

export default router;
