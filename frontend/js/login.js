
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        const users = JSON.parse(localStorage.getItem("taskhub_users")) || [];

        const loggedInUser = users.find(user =>
            user.email === email && user.password === password
        );

        if (!loggedInUser) {
            alert("Invalid email or password. Please try again.");
            return;
        }

        localStorage.setItem("taskhub_loggedInUser", JSON.stringify({
            name: loggedInUser.name,
            email: loggedInUser.email
        }));

        alert("Login successful! Welcome to TaskHub.");

        window.location.href = "dashboard.html";
    });
}
