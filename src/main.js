import { config } from "dotenv"
config()
import express from "express"
import {createServer} from "http"
import { databaseConnection } from "./DB/connection.js"
import routerHandeler from "./utils/router-handler.utils.js";
import cors from "cors"
import { initializeSocket } from "./utils/socket.js";




const app = express()
const server = createServer(app)
const PORT= process.env.PORT || 3000
const whitelist = [process.env.FRONTEND_ORIGIN,undefined ]

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


async function bootstrap(){

    initializeSocket(server);
    app.use(express.json())
    app.use(cors(corsOptions))
    routerHandeler(app, express)
    databaseConnection()
    app.get("/", (req,res)=>{
        res.status(200).json({message:"Hello from get API"})
    })
    app.listen(PORT, ()=>{
        console.log(`Server is listening on port:${PORT}`)
    })
}

export default bootstrap;