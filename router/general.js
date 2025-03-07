const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



// ✅ Task 1: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists!" });
    }
    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully!" });
});

// ✅ Task 2: Get all books
public_users.get('/', function (req, res) {
    return res.status(200).json({ books });
});

// ✅ Task 3: Get book details by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).json(books[isbn]);
    } else {
        res.status(404).json({ message: "Book not found!" });
    }
});

// ✅ Task 4: Get book details by author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const result = Object.values(books).filter(book => book.author.toLowerCase() === author);
    
    if (result.length > 0) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ message: "No books found for this author." });
    }
});

// ✅ Task 5: Get book details by title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const result = Object.values(books).find(book => book.title.toLowerCase() === title);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ message: "Book not found by this title." });
    }
});

// ✅ Task 6: Get book reviews by ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).json({ reviews: books[isbn].reviews });
    } else {
        res.status(404).json({ message: "No reviews found for this ISBN." });
    }
});
public_users.get('/async/books', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:6000/');
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// ✅ Task 11: Get Book by ISBN (Using Async-Await)
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
      const isbn = req.params.isbn;
      const response = await axios.get(`http://localhost:6000/isbn/${isbn}`);
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// ✅ Task 12: Get Books by Author (Using Promise Callbacks)
public_users.get('/async/author/:author', (req, res) => {
  const author = req.params.author;
  axios.get(`http://localhost:6000/author/${author}`)
      .then(response => res.status(200).json(response.data))
      .catch(error => res.status(500).json({ message: "Error fetching books by author", error: error.message }));
});

// ✅ Task 13: Get Books by Title (Using Promise Callbacks)
public_users.get('/async/title/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`http://localhost:6000/title/${title}`)
      .then(response => res.status(200).json(response.data))
      .catch(error => res.status(500).json({ message: "Error fetching books by title", error: error.message }));
});

module.exports.general = public_users;
