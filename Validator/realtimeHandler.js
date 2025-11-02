import { Server } from "socket.io";
import { AnonymousChat } from "../Models/index.js";

export const initRealtimeHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("join_session", async (sessionToken) => {
      if (!sessionToken) return;
      socket.join(`session_${sessionToken}`);
      console.log(`User joined session_${sessionToken}`);
    });

    socket.on("anon_message", async ({ sessionToken, senderRole, message }) => {
      try {
        if (!sessionToken || !message) return;
        const session = await AnonymousChat.getSessionByToken(sessionToken);
        if (!session) return;

        await AnonymousChat.sendMessageBySessionId(session.id, senderRole, message);

        io.to(`session_${sessionToken}`).emit("new_anon_message", {
          senderRole,
          message,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("anon_message error:", err.message);
      }
    });

    socket.on("close_session", async (sessionToken) => {
      try {
        const session = await AnonymousChat.getSessionByToken(sessionToken);
        if (!session) return;

        await AnonymousChat.closeSession(session.id);
        io.to(`session_${sessionToken}`).emit("session_closed", { sessionToken });
      } catch (err) {
        console.error("close_session error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
