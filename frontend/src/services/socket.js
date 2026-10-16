
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket) {
    if (socket.auth?.token !== token) {
      socket.auth = { token };

      if (socket.connected) {
        socket.disconnect();
      }
    }

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.connect();

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
