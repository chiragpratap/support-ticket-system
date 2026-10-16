import "dotenv/config";
import { io } from "socket.io-client";

const token = process.env.TEST_JWT;

if (!token) {
  console.error("Please set TEST_JWT in your .env file");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
});

[
  "ticket:created",
  "ticket:updated",
  "ticket:assigned",
  "ticket:status_changed",
  "ticket:priority_changed",
  "ticket:closed",
  "ticket:changed",
  "dashboard:refresh",
].forEach((event) => {
  socket.on(event, (payload) => {
    console.log(`Received ${event}:`, payload);
  });
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});