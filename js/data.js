const users = [
    { username: "admin", password: "admin123", inventory: [] }
];
const books = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", available: true },
    { title: "1984", author: "George Orwell", available: true },
    { title: "To Kill a Mockingbird", author: "Harper Lee", available: false },
];
const reservedBooks = [];
const borrowedBooks = {};

function addUser(username, password) {
    users.push({ username, password, inventory: [] });
}

function findUser(username) {
    return users.find(user => user.username === username);
}

function addBook(title, author) {
    books.push({ title, author, available: true });
}

function searchBooks(query) {
    return books.filter(book => book.title.toLowerCase().includes(query.toLowerCase()));
}

function reserveBook(title) {
    const book = books.find(book => book.title === title);
    if (book && !book.available) {
        reservedBooks.push(book);
        return true;
    }
    return false;
}

function borrowBook(username, title) {
    const book = books.find(book => book.title === title && book.available);
    if (book) {
        book.available = false;
        if (!borrowedBooks[username]) borrowedBooks[username] = [];
        borrowedBooks[username].push(book);
        return true;
    }
    return false;
}

function returnBook(username, title) {
    const bookIndex = borrowedBooks[username].findIndex(book => book.title === title);
    if (bookIndex !== -1) {
        const book = borrowedBooks[username].splice(bookIndex, 1)[0];
        book.available = true;
        return true;
    }
    return false;
}
