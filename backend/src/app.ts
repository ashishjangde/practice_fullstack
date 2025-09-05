import express from "express";
import cookieparser from 'cookie-parser'
import cors from "cors"
import { errorMiddleware } from "./middlewares/error.middleware";
import type{ Request, Response, NextFunction } from "express";
import { ApiResponse } from "./advices/ApiResponse";
import { ApiError } from "./advices/ApiError";

//routes import 

import authRouter from "./routes/auth.routes";
import sessionRouter from "./routes/session.routes";
import { authMiddleware } from "./middlewares/auth.middleware";

//express

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

interface SyntaxErrorWithBody extends SyntaxError {
    body?: any;
}

app.use((err: SyntaxErrorWithBody, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json(new ApiResponse(null, new ApiError(400 , "Invalid Json Structure")));
    }
    next(err);
});







// routes 

app.use("/api/v1/auth" , authRouter)

app.use("/api/v1/session",authMiddleware ,sessionRouter)


//error middleware

app.use(errorMiddleware)

export default app;