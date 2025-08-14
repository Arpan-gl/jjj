import express from "express";
import { userModel } from "../models/user.models.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all field" });
    }

    const userExist = await userModel.findOne({
      username: username,
      email: email,
    });

    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username: username,
      email: email,
      password: hashPassword,
      uploader: [],
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "user sign Up successfully",
        data: newUser,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;