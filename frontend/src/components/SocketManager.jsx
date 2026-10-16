 
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../features/notifications/notificationSlice";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

import { fetchTickets } from "../features/tickets/ticketSlice";
import { fetchNotifications } from "../features/notifications/notificationSlice";

export default function SocketManager() {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);
    const handleNotification = (notification) => {
  dispatch(addNotification(notification));
};

socket.on("notification:new", handleNotification);
socket.off("notification:new", handleNotification);

    if (!socket) return;

    // Load initial data after authentication.
    dispatch(fetchTickets());
    dispatch(fetchNotifications());

    let refreshTimer;

    const refreshTickets = () => {
      clearTimeout(refreshTimer);

      refreshTimer = setTimeout(() => {
        dispatch(fetchTickets());
      }, 150);
    };

    const refreshNotifications = () => {
      dispatch(fetchNotifications());
    };

    const ticketEvents = [
      "ticket:created",
      "ticket:updated",
      "ticket:closed",
      "ticket:status_changed",
      "ticket:priority_changed",
      "ticket:assigned",
      "ticket:changed",
    ];

    const notificationEvents = [
      "notification:new",
      "notification:created",
      "notification:changed",
    ];

    ticketEvents.forEach((event) => {
      socket.on(event, refreshTickets);
    });

    notificationEvents.forEach((event) => {
      socket.on(event, refreshNotifications);
    });

    return () => {
      ticketEvents.forEach((event) => {
        socket.off(event, refreshTickets);
      });

      notificationEvents.forEach((event) => {
        socket.off(event, refreshNotifications);
      });

      clearTimeout(refreshTimer);
    };
  }, [token, dispatch]);

  return null;
}
