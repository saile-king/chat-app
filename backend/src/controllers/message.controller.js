import User from "../models/user.model.js";
import MessageGroup from "../models/messageGroup.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    io.emit("newMessage", {
      
    });
    const messages = await MessageGroup.find().populate("senderId", 'fullName _id profile');
    const messageParsed = messages.map((message) => {
      const { senderId, ...rest } = message.toObject()
      return {
        ...rest,
        senderId: senderId._id,
        user: senderId
      }
    })

    res.status(200).json(messageParsed);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { fullName, profile } = req.user;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new MessageGroup({
      senderId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const response = {
      ...newMessage.toObject(),
      user: {
        fullName,
        _id: senderId,
        profile
      }
    }

    io.emit("newMessage", response);
    res.status(201).json(response);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};