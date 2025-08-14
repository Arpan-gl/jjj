import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini.js';
import cookieParser from 'cookie-parser';
import signUpRouter from './routes/signUp.js';
import signInRouter from './routes/signIn.js';
import signOutRouter from './routes/signOut.js';
import getUserDetailRoute from './routes/getUser.js';
import AilawyerRoute from './routes/Ailawyer.js';

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'], // Vite's default ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anumaancs:pagal@gdg.g5f6w.mongodb.net/?retryWrites=true&w=majority&appName=GDG';  


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,serverSelectionTimeoutMS: 20000 })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));






//routes
app.use('/api/gemini', geminiRoutes);
app.use("/api/signUp",signUpRouter);
app.use("/api/signIn",signInRouter);
app.use("/api/signOut",signOutRouter);
app.use("/api/getUserDetail",getUserDetailRoute);
app.use("/api/Ailawyer",AilawyerRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});