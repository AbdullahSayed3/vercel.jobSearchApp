import { Router } from "express";
import * as chatService from "./Services/chat.services.js";
import { authenticationMiddleware, authorizationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { ErrorHandler } from "../../Middlewares/error-handler.middleware.js";

const chatController = Router();


chatController.get(
  "/chat-history/:userId",
  authenticationMiddleware(),
  ErrorHandler(chatService.getChatHistoryService)
);

chatController.post(
  "/start-chat/:userId",
  authenticationMiddleware(),
  authorizationMiddleware(["HR", "CompanyOwner"]),
  ErrorHandler(chatService.startChatService)
);

export default chatController;
