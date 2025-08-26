import express from "express";
import cookieparser from 'cookie-parser'
import cors from "cors"

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




//error middleware



export default app;