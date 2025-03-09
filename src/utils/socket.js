import { Server } from "socket.io";
import { Chat } from "../DB/Models/chat.model.js";

export let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        let chat = await Chat.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [senderId, receiverId], messages: [] });
        }

        const newMessage = { sender: senderId, text };
        chat.messages.push(newMessage);
        await chat.save();

        io.to(receiverId).emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
