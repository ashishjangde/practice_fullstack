import app from "./app";
import { connectDb } from "./db/connectDb";
import "dotenv/config";


const PORT = process.env.PORT || 5000;


app.get("/health", (req, res)=>{
   res.json({
        message : "Server is Helathy"
    })
})

// app.get("/",(req, res)=>{
// return res.json("hello")
// })

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error);
    }
    );