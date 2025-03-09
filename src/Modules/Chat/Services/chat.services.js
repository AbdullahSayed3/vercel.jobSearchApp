import { Chat } from "../../../DB/Models/chat.model.js";


export const getChatHistoryService = async (req, res) => {
    const { userId } = req.params; 
    const chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate("messages.sender", "name email");

    if (!chat) {
      return res.status(404).json({ message: "No chat history found" });
    }

    res.status(200).json(chat);

};


export const startChatService = async (req, res) => {
    const { userId } = req.params;
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
    });

    if (existingChat) {
      return res.status(200).json({ message: "Chat already exists", chat: existingChat });
    }

    const newChat = new Chat({ participants: [req.user._id, userId], messages: [] });
    await newChat.save();

    res.status(201).json({ message: "Chat started successfully", chat: newChat });

};
