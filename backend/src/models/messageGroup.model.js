import mongoose from "mongoose";

const messageGroupSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);

const messageGroup = mongoose.model("MessageGroup", messageGroupSchema);

export default messageGroup;