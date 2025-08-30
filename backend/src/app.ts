import express from "express";
import cookieparser from 'cookie-parser'
import cors from "cors"
import authRouter from "./routes/auth.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express()


//initial middlewares 

app.use(cors({
    credentials: true,
    origin:[
        "http://localhost:3000"
    ]
}))

app.use(express.json({
    limit: "50 kb",
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"))

app.use(cookieparser())

// routes 

app.use("/api/v1/auth" , authRouter)




//error middleware

app.use(errorMiddleware)

export default app;