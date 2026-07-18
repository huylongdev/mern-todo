import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import todoRoutes from "./routes/todos.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/todos", todoRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
});
