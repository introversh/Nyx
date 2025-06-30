import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName) {
      return res.status(400).json({ message: "Enter the full name." });
    }
    if (!email) {
      return res.status(400).json({ message: "Enter the email." });
    }
    if (!password) {
      return res.status(400).json({ message: "Enter the password." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password length can't be less than 6 characters." });
    }
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        message: "Another user with the same email adress already exists.",
      });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      //jwt token generation
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilepic,
      });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All input fields are neccessary." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }
    generateToken(user._id, res);
    return res
      .status(200)
      .json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilepic,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out Successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile Picture Not Provided" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId,{profilepic:uploadResponse.secure_url},{new:true})
    res.status(200).json(updatedUser)
  
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Internal Server Error."})
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilepic, // ⬅️ make sure this exists
    });
  } catch (error) {
    console.log("Error in checkAuth: ", error.message);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

