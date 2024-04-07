// index.js
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const { findBooks, updateBookById, createBook } = require('./public/javascript/books');
const { client, dbName, collectionName } = require('./public/javascript/mongodb'); 

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Admin
app.get('/admin', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});
// Menu
app.get('/menu', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'menu.html'));
});
// Home
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'viewBooks.html'));
});

app.post('/', (req, res) => {
    const { option } = req.body;
    if (option === 'insert') {
        res.redirect('/insert');
    } else {
        res.sendStatus(400);
    }
});

// Add Book
app.get('/insert', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','pages', 'insertBooks.html'));
});

app.post('/insert', async (req, res) => {
    try {
        let books = req.body;
        if (!Array.isArray(books.id)) {
            books = [books];
        }
        const bookObjects = books.id.map((id, index) => ({
            id: id,
            name: books.name[index],
            type: books.type[index],
            author: books.author[index],
            publicationYear: books.publicationYear[index],
            rating: books.rating[index]
        }));
        await createBook(bookObjects);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Error creating book' });
    }
});

// View Book
app.get('/view', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'viewBooks.html'));
});

app.post('/view', async (req, res) => {
    try {
        const books = await findBooks(req.body.bookId);
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books data');
    }
});

// Update Book
app.get('/update', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'updateBooks.html'));
});

app.post('/update', async (req, res) => {
    const bookId = req.body.bookId;
    const bookInfo = await findBooks(bookId);
    if (bookInfo.length > 0) { 
        res.json(bookInfo[0]); 
    } else {
        res.status(404).send('Book not found');
    }
});

app.post('/update/:id', async (req, res) => {
    const bookId = req.params.id;
    const updatedBook = req.body;
    await updateBookById(bookId, updatedBook);
    res.redirect('/');
});


// Delete Book
app.get('/delete', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'deleteBooks.html'));
});

app.post('/delete', async (req, res) => {
    const bookIdToDelete = req.body.bookId;
    const result = await client.db(dbName).collection(collectionName).deleteOne({ $or: [{ id: bookIdToDelete }, { _id: bookIdToDelete }] });
    if (result.deletedCount === 1) {
        console.log(`Deleted book with ID: ${bookIdToDelete} successfully.`);
        res.sendStatus(200);
    } else {
        console.log(`Book with ID ${bookIdToDelete} not found.`);
        res.sendStatus(404);
    }
});

// Search Book
app.get('/search', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'searchBooks.html'));
});

app.post('/search', async (req, res) => {
    const searchCriteria = req.body;
    const query = {};
    Object.keys(searchCriteria).forEach(key => {
        if (searchCriteria[key]) {
            if (key === 'publicationYear' || key === 'rating') {
                query[key] = parseFloat(searchCriteria[key]);
            } else if (key === 'name' || key === 'type' || key === 'author') {
                query[key] = { $regex: new RegExp(searchCriteria[key], 'i') };
            } else if (key === 'id') {
                query[key] = searchCriteria[key];
            }
        }
    });
    try {
        const books = await findBooks(query);
        if (books.length > 0) {
            res.status(200).json(books);
        } else {
            res.status(404).json({ message: 'No books found' });
        }        
    } catch (error) {
        console.error('Error searching for books:', error);
    }
});

// Start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
