 
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addNotification,
  fetchNotifications,
  markNotificationRead,
} from "../features/notifications/notificationSlice";

import { getSocket } from "../services/socket";

export default function NotificationBell() {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const {
    items = [],
    unreadCount = 0,
    loading,
    error,
  } = useSelector((state) => state.notifications);

  const token = useSelector((state) => state.auth.token);

  // Fetch notifications when the user is authenticated.
  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, token]);

  // Listen for new notifications through Socket.IO.
  useEffect(() => {
    if (!token) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [token, dispatch]);

  const handleMarkRead = (notification) => {
    if (notification.isRead) return;

    const id = notification._id ?? notification.id;

    if (id) {
      dispatch(markNotificationRead(id));
    }
  };

  if (!token) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-lg border px-4 py-2 hover:bg-gray-100"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        🔔 Notifications

        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border bg-white p-3 text-gray-900 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Notifications</h2>

            <button
              type="button"
              className="text-sm text-blue-600"
              onClick={() => dispatch(fetchNotifications())}
            >
              Refresh
            </button>
          </div>

          {loading && (
            <p className="py-3 text-sm">Loading notifications...</p>
          )}

          {error && (
            <p className="py-3 text-sm text-red-600">
              {typeof error === "string"
                ? error
                : "Failed to load notifications."}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="py-5 text-center text-sm text-gray-500">
              No notifications yet.
            </p>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {items.map((notification) => {
              const id = notification._id ?? notification.id;

              return (
                <div
                  key={id}
                  className={`rounded-lg border p-3 ${
                    notification.isRead
                      ? "bg-white"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <p className="text-sm">
                    {notification.message ?? "Ticket notification"}
                  </p>

                  {notification.createdAt && (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>
                  )}

                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      className="mt-2 text-sm font-medium text-blue-600"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
