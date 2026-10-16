 
import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
  await connectDB();

  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
