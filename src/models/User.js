import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    photo: String,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
