import mongoose from "mongoose";
import { User } from "./userTypes";



const userSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function (this: User) {
            return this.authProvider === "local";
        },
    },
    image: {
        type: String
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    googleId: {
        type: String
    }

}, { timestamps: true });

export default mongoose.model<User>("User", userSchema)