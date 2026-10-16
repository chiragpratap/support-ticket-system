 
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  // Authenticate every socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decoded === "string" || !decoded.sub) {
        return next(new Error("Invalid token payload"));
      }

      const user = await User.findById(decoded.sub).select(
        "_id name email role"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // Handle authenticated connections
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Every user joins their personal room
    socket.join(`user:${userId}`);

    // Admins join the admins room
    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    console.log(`Socket connected: ${userId}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}

// Send an event to one specific user
export function emitToUser(userId, event, data) {
  if (!io) {
    console.warn("Socket.IO is not initialized");
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
}

// Send an event to all connected admins
export function emitToAdmins(event, data) {
  if (!io) {
    console.warn("Socket.IO is not initialized");
    return;
  }

  io.to("admins").emit(event, data);
}
