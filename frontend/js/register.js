
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("taskhub_users")) || [];

        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            alert("An account with this email already exists!");
            return;
        }

        const newUser = {
            name: name,
            email: email,
            password: password
        };

        users.push(newUser);

        localStorage.setItem("taskhub_users", JSON.stringify(users));

        alert("Registration successful! Please login.");

        registerForm.reset();

        window.location.href = "login.html";
    });
}
