
import { getDashboardStats } from "../services/dashboard.service.js";

export const dashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
