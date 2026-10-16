import { Router } from "express";
import {
  listNotifications,
  readNotification,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/:id/read", readNotification);

export default router;