// Initialize books from localStorage or with default values
let books = JSON.parse(localStorage.getItem('books')) || [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", available: true },
    { title: "1984", author: "George Orwell", genre: "Dystopian", available: true },
    { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Historical", available: false },
    { title: "Moby Dick", author: "Herman Melville", genre: "Adventure", available: true }
];

// Load user inventory from localStorage or initialize as empty
const userInventory = JSON.parse(localStorage.getItem('userInventory')) || {};
const notifications = []; // Store notifications

// A* search algorithm implementation for searching books
function aStarSearch(query, books) {
    const openSet = [];
    const closedSet = new Set();


    for (const book of books) {
        if (book.title.toLowerCase().includes(query.toLowerCase())) {
            openSet.push({
                title: book.title,
                cost: 1, 
                heuristic: heuristic(book.title, query),
                book: book
            });
        }
    }

    while (openSet.length > 0) {
        openSet.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));

        const currentNode = openSet.shift();
        if (currentNode.book) {
            return [currentNode.book]; // Found the book
        }
        closedSet.add(currentNode.title);

        for (const book of books) {
            if (!closedSet.has(book.title) && book.title.toLowerCase().includes(query.toLowerCase())) {
                openSet.push({
                    title: book.title,
                    cost: currentNode.cost + 1,
                    heuristic: heuristic(book.title, query),
                    book: book
                });
            }
        }
    }
    return []; 
}



function heuristic(bookTitle, query) {
    return Math.abs(bookTitle.length - query.length);
}

// A* search algorithm for book recommendations
function aStarRecommendation(preferences, books) {
    const openSet = [];

    books.forEach(book => {
        let similarity = 0;

        // 1. Genre similarity: Add score if genres match
        if (book.genre === preferences.genre) similarity += 2;

        // 2. Author similarity: Add score if authors match
        if (book.author === preferences.author) similarity += 2;

        // 3. Popularity: Calculate popularity based on how many users borrowed/reserved the book
        const popularity = Object.values(userInventory).reduce((count, userBooks) => {
            return count + userBooks.filter(b => b.title === book.title).length;
        }, 0);

        // Normalize popularity score and add to similarity
        similarity += popularity / 5;

        // Only add books that have a positive similarity score (i.e., matching preferences)
        if (similarity > 0) {
            openSet.push({
                book,
                cost: 1, // Cost to explore this book
                heuristic: 1 / similarity // Inverse similarity as heuristic
            });
        }
    });

    // Sort by total cost (cost + heuristic)
    openSet.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));

    // Return the top 5 most relevant recommendations
    return openSet.slice(0, 5).map(item => item.book);
}

// Function to display the recommended books for the student
function displayRecommendations(username) {
    // Example preferences; this would come from the student's borrowing history
    const preferences = {
        genre: "Dystopian",  // Example preference
        author: "George Orwell"
    };

    // Get recommended books based on preferences
    const recommendedBooks = aStarRecommendation(preferences, books);

    // Display the recommended books in the student's dashboard
    const recommendationsList = document.getElementById("recommendationsList");
    recommendationsList.innerHTML = recommendedBooks.map(book => `
        <li>${book.title} by ${book.author}</li>
    `).join('');
}

// Event listener to display recommendations on page load
document.addEventListener("DOMContentLoaded", () => {
    const loggedInUsername = "student";  // Replace with the actual username logic
    displayRecommendations(loggedInUsername);  // Show recommended books for the student
});


// Function to add a new user (not implemented in admin functionality)
function addUser(username, password) {
    // Placeholder for adding a user (needs user management)
}

// Function to find a user by username (not implemented in admin functionality)
function findUser(username) {
    // Placeholder for finding a user (needs user management)
}

function displayCatalog() {
    const catalogList = document.getElementById("catalogList");
    catalogList.innerHTML = ''; // Clear previous entries before displaying catalog

    books.forEach((book, index) => {
        catalogList.innerHTML += `
            <li>
                ${book.title} by ${book.author} - ${book.available ? 'Available' : 'Unavailable'}
                <button onclick="removeBook(${index})">Remove</button>
            </li>
        `;
    });
}

// Function to add a new book
function addBook(title, author) {
    books.push({ title, author, available: true });
    localStorage.setItem('books', JSON.stringify(books));
    alert(`${title} by ${author} has been added.`);
    displayCatalog(); // Refresh the catalog display
}

// Function to remove a book
function removeBook(index) {
    const removedBook = books.splice(index, 1);
    localStorage.setItem('books', JSON.stringify(books));
    alert(`"${removedBook[0].title}" has been removed.`);
    displayCatalog(); // Refresh the catalog display
}

// Function to borrow a book
function borrowBook(title, username) {
    const book = books.find(b => b.title === title && b.available);
    if (book) {
        book.available = false; // Mark book as unavailable
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 7); // Set return date to 7 days from now

        if (!userInventory[username]) {
            userInventory[username] = [];
        }

        userInventory[username].push({
            title,
            borrowedOn: new Date(),
            returnDate,
            status: 'Borrowed'
        });

        // Save updated inventory to localStorage
        localStorage.setItem('userInventory', JSON.stringify(userInventory));

        alert(`You have borrowed "${title}".`);
        localStorage.setItem('books', JSON.stringify(books));
        displayCatalog(); // Refresh the catalog display
        displayAllBorrowedBooks(); // Refresh admin display to show borrowed books
    } else {
        alert(`"${title}" is currently unavailable.`);
    }
}

// Function to reserve a book
function reserveBook(title, username) {
    const book = books.find(b => b.title === title && !b.available);
    if (book) {
        alert(`You have reserved "${title}".`);
        if (!userInventory[username]) {
            userInventory[username] = [];
        }

        userInventory[username].push({
            title,
            reservedOn: new Date(),
            status: 'Reserved'
        });

        // Save updated inventory to localStorage
        localStorage.setItem('userInventory', JSON.stringify(userInventory));
    } else {
        alert(`"${title}" is available. You can borrow it.`);
    }
}

// Function to display student's borrowed books
function displayStudentInventory(username) {
    const inventoryList = document.getElementById("inventoryList");
    const inventory = userInventory[username] || [];
    inventoryList.innerHTML = inventory.map(item => `
        <li>
            ${item.title} - Borrowed on: ${new Date(item.borrowedOn).toLocaleDateString()} - 
            Return Date: ${new Date(item.returnDate).toLocaleDateString()} - 
            Status: ${item.status || 'Borrowed'}
        </li>
    `).join('');
}

// Function to display all borrowed books in admin dashboard
function displayAllBorrowedBooks() {
    const adminBorrowedList = document.getElementById("adminBorrowedList");
    adminBorrowedList.innerHTML = ''; // Clear previous entries

    // Loop through each user in userInventory
    for (const [username, inventory] of Object.entries(userInventory)) {
        inventory.forEach(item => {
            if (item.status === 'Borrowed') {
                adminBorrowedList.innerHTML += `
                    <li>
                        ${item.title} - Borrowed by: ${username} - Borrowed on: ${new Date(item.borrowedOn).toLocaleDateString()} - 
                        Return Date: ${new Date(item.returnDate).toLocaleDateString()}
                    </li>
                `;
            }
        });
    }
}

// Function to display search results with a borrow button
function displaySearchResults(results) {
    const resultsList = document.getElementById("searchResults");
    resultsList.innerHTML = results.map(book => `
        <li>${book.title} by ${book.author} - ${book.available ? 'Available' : 'Unavailable'}
        ${book.available ? `<button onclick="borrowBook('${book.title}', 'student')">Borrow</button>` : ''} 
        </li>
    `).join('');
}

// Function to display reserve options with a reserve button for unavailable books
function displayReserveResults(unavailableBooks) {
    const reserveList = document.getElementById("reserveResults");
    reserveList.innerHTML = unavailableBooks.map(book => `
        <li>${book.title} by ${book.author} - Unavailable
        <button onclick="reserveBook('${book.title}', 'student')">Reserve</button>
        </li>
    `).join('');
}

// Function to display notifications
function displayNotifications() {
    const notificationsList = document.getElementById("notificationsList");
    notificationsList.innerHTML = notifications.map(notification => `
        <li>${notification}</li>
    `).join('');
}

// Event listeners
document.getElementById("searchButton")?.addEventListener("click", () => {
    const query = document.getElementById("searchInput").value;
    const results = aStarSearch(query, books);
    displaySearchResults(results);
});

document.addEventListener("DOMContentLoaded", () => {
    const loggedInUsername = "admin"; // Replace this with the actual logged-in username
    displayAllBorrowedBooks(); // Display all borrowed books for admin
    displayCatalog(); // Display the catalog on page load
    displayBorrowedBooksByUsers(); // Display all users who borrowed books
    displayActiveUsers(); // Display active users
});

function displayActiveUsers() {
    const activeUserList = document.getElementById("activeUserList");
    activeUserList.innerHTML = ''; // Clear previous entries

    // Loop through each user in activeUsers
    for (const [username, loginTime] of Object.entries(activeUsers)) {
        activeUserList.innerHTML += `
            <li>
                ${username} logged in on: ${new Date(loginTime).toLocaleString()}
            </li>
        `;
    }
}

// Function to display borrowed books by each user
function displayBorrowedBooksByUsers() {
    const borrowedBooksList = document.getElementById("borrowedBooksList");
    borrowedBooksList.innerHTML = ''; // Clear previous entries

    // Loop through each user in userInventory
    for (const [username, inventory] of Object.entries(userInventory)) {
        inventory.forEach(item => {
            if (item.status === 'Borrowed') {
                borrowedBooksList.innerHTML += `
                    <li>
                        ${item.title} - Borrowed by: ${username} - Borrowed on: ${new Date(item.borrowedOn).toLocaleDateString()} - 
                        Return Date: ${new Date(item.returnDate).toLocaleDateString()}
                    </li>
                `;
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loggedInUsername = "admin"; // Replace this with the actual logged-in username

    displayCatalog(); // Display the catalog on page load

    // Check if we are on the admin dashboard
    if (document.getElementById("adminBorrowedList")) {
        displayAllBorrowedBooks(); // Display all borrowed books for admin
    }

    // Check if we are on the admin dashboard (borrowedBooksList should exist)
    if (document.getElementById("borrowedBooksList")) {
        displayBorrowedBooksByUsers(); // Display borrowed books by users
    }

    // Check if we are on the student dashboard
    const loggedInUser = "student"; // Replace with actual logged-in username or role check
    if (document.getElementById("inventoryList")) {
        displayStudentInventory(loggedInUser); // Display student inventory
    }

    displayActiveUsers(); // Display active users
});

function logout() {
    // Clear user session data from localStorage or sessionStorage
    localStorage.removeItem('loggedInUser'); // Adjust according to your session storage method
    alert('You have been logged out.'); // Optional notification
    window.location.href = 'login.html'; // Redirect to the login page
}

// Add event listeners for the logout buttons
document.getElementById("logoutButtonAdmin")?.addEventListener("click", logout);
document.getElementById("logoutButtonStudent")?.addEventListener("click", logout);
