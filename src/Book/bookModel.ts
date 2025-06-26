import mongoose from 'mongoose'
import { Book } from './bookTypes'

const bookSchema = new mongoose.Schema<Book>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        // add ref
        ref: "User",
        required: true,
    },
    coverImage: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },

    //download & read count
    downloadCount: {
        type: Number,
        default: 0,
    },
    readCount: {
        type: Number,
        default: 0
    },

    //favorites
    favorites: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    }
}, { timestamps: true });

export default mongoose.model<Book>("Book", bookSchema);