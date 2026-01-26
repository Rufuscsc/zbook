import mongoose from "mongoose";


const BookSchema = new mongoose.Schema({
    title: { type: String, required: true},
    author: { type: String, required: true},
    cover: { type: String, required: true},
    genre: { type: String, required: true},
    description: { type: String, required: true},
    year: { type: Number},
    addedBy: {
        id: { type: String, required: true},
        firstName: {type: String, required: true}
    }
}, 
{timestamps : true}
);


const Book = mongoose.models.Book || mongoose.model("Book", BookSchema);

export default Book;

