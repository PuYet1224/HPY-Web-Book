const express = require('express');
const app = express();

const { connectToMongoDB } = require('./mongodb');
const multer = require('multer');

// Khởi tạo đối tượng lưu trữ (storage) cho Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });

async function findBooks(criteria) {
    try {
        const usersCollection = await connectToMongoDB();
        let books;
        if (criteria) {
            if (typeof criteria === 'string') {
                const book = await usersCollection.findOne({ id: criteria });
                return book ? [book] : [];
            } else {
                books = await usersCollection.find(criteria).toArray();
            }
        } else {
            books = await usersCollection.find().toArray();
        }
        return books;
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

// Hàm cập nhật sách dựa trên ID và thông tin sách mới
async function updateBookById(bookId, updatedBook) {
    try {
        const booksToUpdate = {
            $set: {
                id: bookId,
                name: updatedBook.name,
                type: updatedBook.type,
                author: updatedBook.author,
                publicationYear: parseInt(updatedBook.publicationYear),
                rating: parseFloat(updatedBook.rating),
                image: '/images/' + updatedBook.image,
                price: updatedBook.price,
                description: updatedBook.description
            }
        };
        const usersCollection = await connectToMongoDB();
        const result = await usersCollection.updateOne({ id: bookId }, booksToUpdate);
        console.log(`Updated book with ID: ${bookId} successfully!`);
        return result
    } catch (err) {
        console.error('Error:', err);
    }
}

// Hàm thêm sách mới vào cơ sở dữ liệu
async function createBook(books) {
    try {
        const booksToInsert = books.map(book => ({
            id: book.id,
            name: book.name,
            type: book.type,
            author: book.author,
            publicationYear: parseInt(book.publicationYear),
            rating: parseFloat(book.rating),
            image: '/images/' + book.image,
            price: book.price,
            description: book.description
        }));
        const usersCollection = await connectToMongoDB();
        const result = await usersCollection.insertMany(booksToInsert);
        console.log(`${result.insertedCount} books added successfully!!!`);
        return result;
    } catch (err) {
        console.error('Error:', err);
    }
}

// Middleware xử lý tải lên hình ảnh
async function handleImageUpload(req, res, next) {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error('No images uploaded');
        }

        const imageUrl = req.files[0].filename;
        req.imageUrl = imageUrl; 
        next();
    } catch (err) {
        console.error('Error handling image upload:', err);
        res.status(400).send('No images uploaded');
    }
}

// Export các hàm và middleware
module.exports = { findBooks, updateBookById, createBook, handleImageUpload, upload };
