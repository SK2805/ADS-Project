document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm")?.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Hardcoded admin credentials
        const adminUsername = "admin";
        const adminPassword = "admin123"; // Choose a secure password

        // Check if the login is for the admin
        if (username === adminUsername && password === adminPassword) {
            // Redirect admin to admin dashboard
            window.location.href = "admin.html";
        } else {
            // Check stored users for student login
            const storedPassword = localStorage.getItem(username);

            if (storedPassword && storedPassword === password) {
                // Redirect to student dashboard
                window.location.href = "student.html";
            } else {
                alert("Invalid username or password.");
            }
        }
    });
});
