import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getUserToSocketId } from "../lib/socket.js"

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsers controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { id: userToChatId } = req.params;
        const filteredMessages = await Message.find({
            $or: [
                { senderId: loggedInUserId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: loggedInUserId }
            ]
        })
        res.status(200).json(filteredMessages);
    } catch (error) {
        console.log("Error in getMessages controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { text, image } = req.body;
        const { id: userToChatId } = req.params;

        if (!text && !image) {
            return res.status(400).json({ error: "Message text or image is required" });
        }

        let imageurl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageurl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId: loggedInUserId,
            receiverId: userToChatId,
            text,
            image: imageurl
        })
        await newMessage.save();

        const userToChatToSocketId = getUserToSocketId(userToChatId);
        if (userToChatToSocketId) {
            io.to(userToChatToSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}