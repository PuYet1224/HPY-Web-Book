'use strict';

const { connectToMongoDB } = require('./mongodb');

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

async function updateBookById(bookId, updatedBook) {
    try {
        const usersCollection = await connectToMongoDB();
        const booksToUpdate = {
            $set: {
                id: bookId, 
                name: updatedBook.name,
                type: updatedBook.type,
                author: updatedBook.author,
                publicationYear: parseFloat(updatedBook.publicationYear),
                rating: parseFloat(updatedBook.rating)
            }
        };
        await usersCollection.updateOne({ id: bookId }, booksToUpdate);
        console.log(`Updated book with ID: ${bookId} successfully!`);
    } catch (err) {
        console.error('Error:', err);
    }
}

async function createBook(books) {
    try {
        const booksToInsert = books.map(book => ({
            id: book.id,
            name: book.name,
            type: book.type,
            author: book.author,
            publicationYear: parseFloat(book.publicationYear),
            rating: parseFloat(book.rating)
        }));
        const usersCollection = await connectToMongoDB();
        const result = await usersCollection.insertMany(booksToInsert);
        console.log(`${result.insertedCount} books added successfully!!!`);
        return result;
    } catch (err) {
        console.error('Error:', err);
    }
}

module.exports = { findBooks, updateBookById, createBook };
