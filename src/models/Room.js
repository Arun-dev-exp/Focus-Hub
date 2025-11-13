import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    timerMinutes: { type: Number, required: true },
    breakMinutes: { type: Number, required: true },
    isBreak: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    participants: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            joinedAt: { type: Date, default: Date.now },
        }
    ],
    isActive: { type: Boolean, default: true },
},
    //it adds createdAt and updatedAt feilds automatically in the mongoo DB
    { timestamps: true });


export default mongoose.model('Room', roomSchema);