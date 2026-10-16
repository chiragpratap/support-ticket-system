import {
  getNotifications,
  markNotificationRead,
} from "../services/notification.service.js";

export const listNotifications = async (req, res, next) => {
  try {
    const result = await getNotifications(
      req.user._id,
      req.query.page
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (req, res, next) => {
  try {
    const notification = await markNotificationRead(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};