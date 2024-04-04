'use strict'

const { MongoClient } = require('mongodb');

const url = 'mongodb://0.0.0.0:27017';
const client = new MongoClient(url);
const dbName = 'test';
const collectionName = 'books';

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB successfully!!!');
        return client.db(dbName).collection(collectionName);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        console.log('MongoDB connection is closed!')
    }
}

module.exports = { connectToMongoDB, client, dbName, collectionName };
