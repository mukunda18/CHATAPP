import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser"
import { app, server } from "./lib/socket.js"
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();


if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

connectDB().then(() => {
  server.listen(PORT, () => console.log("Server running on port", PORT));
});
