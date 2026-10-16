import Notification from "../models/Notification.js";
import { emitToUser } from "../socket.js";

const messages = {
  "ticket:assigned": "A ticket has been assigned to you.",
  "ticket:updated": "A ticket has been updated.",
  "ticket:status_changed": "A ticket's status has changed.",
  "ticket:priority_changed": "A ticket's priority has changed.",
  "ticket:closed": "A ticket has been closed.",
};

export async function createNotification({
  recipient,
  ticketId,
  type,
}) {
  if (!recipient || !messages[type]) return null;

  const notification = await Notification.create({
    recipient,
    ticket: ticketId ?? null,
    type,
    message: messages[type],
  });

  // Persist first, then send the real-time event.
  emitToUser(recipient, "notification:new", notification);

  return notification;
}

export async function getNotifications(userId, page = 1) {
  const limit = 20;
  const currentPage = Math.max(1, Number(page) || 1);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("ticket", "title status priority")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit),

    Notification.countDocuments({
      recipient: userId,
      isRead: false,
    }),
  ]);

  return {
    notifications,
    unreadCount,
    page: currentPage,
    limit,
  };
}

export async function markNotificationRead(
  notificationId,
  userId
) {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
}