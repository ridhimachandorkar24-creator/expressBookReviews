const express = require('express');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User successfully registered. Now you can log in."
  });
});

// Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get a book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book);
});

// Get books by author (case-insensitive partial match)
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const results = Object.values(books).filter(book =>
    book.author.toLowerCase().includes(author)
  );

  return res.status(200).json(results);
});

// Get books by title (case-insensitive partial match)
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const results = Object.values(books).filter(book =>
    book.title.toLowerCase().includes(title)
  );

  return res.status(200).json(results);
});

// Get reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;


const axios = require('axios');

// Axios client for testing the public book APIs.
// The Express server must be running on port 5000.

async function getAllBooks() {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('All books:', response.data);
  } catch (error) {
    console.error('Error retrieving books:', error.message);
  }
}

function getBooksByISBN(isbn) {
  return axios
    .get(`http://localhost:5000/isbn/${encodeURIComponent(isbn)}`)
    .then(response => {
      console.log('Book by ISBN:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error retrieving book by ISBN:', error.message);
    });
}

async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    console.log('Books by author:', response.data);
  } catch (error) {
    console.error('Error retrieving books by author:', error.message);
  }
}

async function getBooksByTitle(title) {
  try {
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );
    console.log('Books by title:', response.data);
  } catch (error) {
    console.error('Error retrieving books by title:', error.message);
  }
}

// Run these functions directly from the terminal when requested.
if (require.main === module) {
  const [operation, ...args] = process.argv.slice(2);

  switch (operation) {
    case 'all':
      getAllBooks();
      break;
    case 'isbn':
      getBooksByISBN(args.join(' '));
      break;
    case 'author':
      getBooksByAuthor(args.join(' '));
      break;
    case 'title':
      getBooksByTitle(args.join(' '));
      break;
    default:
      console.log(
        'Usage: node router/general.js all | isbn <ISBN> | author <name> | title <title>'
      );
  }
}
