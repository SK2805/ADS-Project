document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signupForm")?.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("newUsername").value;
        const password = document.getElementById("newPassword").value;

        if (localStorage.getItem(username)) {
            alert("Username already exists. Please choose a different one.");
        } else {
            // Save the user in localStorage
            localStorage.setItem(username, password);
            alert("Signup successful! You can now login.");
            window.location.href = "login.html";
        }
    });
});
