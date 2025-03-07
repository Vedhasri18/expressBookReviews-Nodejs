const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];  // ✅ Users are stored here

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// ✅ Task 7: Login as a registered user (Fixed session issue)
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password!" });
    }

    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

    // ✅ Fix: Save username in session
    req.session.accessToken = token;
    req.session.username = username;

    res.status(200).json({ message: "Login successful!", token });
});

// ✅ Task 8: Add/Modify a Book Review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    if (!req.session || !req.session.accessToken || !req.session.username) {
        return res.status(401).json({ message: "Unauthorized: Please login first" });
    }

    const username = req.session.username;  // ✅ Fix: Use username from session

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found!" });
    }

    books[isbn].reviews[username] = review;

    res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });
});

// ✅ Task 9: Delete a Book Review (Fixed JWT verification)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.session || !req.session.accessToken || !req.session.username) {
        return res.status(401).json({ message: "Unauthorized: Please login first" });
    }

    const username = req.session.username;  // ✅ Fix: Use session-stored username

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found!" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found from this user for this book!" });
    }

    delete books[isbn].reviews[username];

    res.status(200).json({ message: "Review deleted successfully!", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
