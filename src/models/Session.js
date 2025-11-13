import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: { type: String, enum: ["focus", "break"], required: true },
    duration: Number,

    startedAt: Date,
    endedAt: Date,
});

export default mongoose.model("Session", sessionSchema);
