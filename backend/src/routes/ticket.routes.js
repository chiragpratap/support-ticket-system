
import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

import {
  create,
  list,
  getOne,
  update,
  close,
  changeStatus,
  changePriority,
  assign,
} from "../controllers/ticket.controller.js";

const router = Router();

router.use(protect);

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.patch("/:id/close", close);

router.patch(
  "/:id/status",
  authorizeRoles("admin"),
  changeStatus
);

router.patch(
  "/:id/priority",
  authorizeRoles("admin"),
  changePriority
);

router.patch(
  "/:id/assign",
  authorizeRoles("admin"),
  assign
);

export default router;
