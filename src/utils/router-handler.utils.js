import authcontroller from "../Modules/Auth/auth.controller.js";
import userController from "../Modules/User/user.controller.js";
import companyController from "../Modules/Company/company.controller.js";
import jobController from "../Modules/Job/job.controller.js"
import { GlobalErrorHandler } from "../Middlewares/error-handler.middleware.js";
import { mainSchema } from "../GraphQL/main.schema.js";
import { createHandler } from "graphql-http/lib/use/express";
import chatController from "../Modules/Chat/chat.controller.js";

const routerHandeler = (app, express) => {
  app.all("/graphql", createHandler({ schema: mainSchema }));

  app.use("/auth", authcontroller);
  app.use("/user", userController);
  app.use("/company", companyController);
  app.use("/job", jobController);
  app.use("/chat", chatController);

  app.get("/", (req, res) =>
    res.status(200).json({ message: "Welcome to get API" })
  );

  app.all("*", (req, res) =>
    res.status(404).json({
      message: "Route not found please make sure from your URL and your Method",
    })
  );

  app.use(GlobalErrorHandler);
};

export default routerHandeler;
