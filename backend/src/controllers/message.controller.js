import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import {getReceiverSocketId, io} from "../lib/socket.js"

export const getUsersForSidebar = async (req, res)=>{
    try {
        const loggedInUser = req.user._id
        const filteredUsers = await User.find({_id:{$ne:loggedInUser}}).select("-password");
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const getMessages = async (req,res)=>{
    try {
        const {id:userToChatId}=req.params 
        const myId = req.user._id

        const messages = await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}

            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const sendMessage = async (req,res)=>{
    console.log(req.user._id)
    try {
        const {text,image}= req.body;
        const {id:receiverId}=req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;

        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image
        })

        await newMessage.save();

         const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
            res.status(201).json(newMessage)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}