
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});

export default router;
