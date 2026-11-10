
// TaskHub - Dynamic Dashboard
// Check whether a user is logged in
const loggedInUser = JSON.parse(
    localStorage.getItem("taskhub_loggedInUser")
);

if (!loggedInUser) {
    alert("Please login first to access TaskHub.");
    window.location.href = "login.html";
}

function updateDashboard() {
    const tasks = JSON.parse(
    localStorage.getItem(`taskhub_tasks_${loggedInUser.email}`)
    ) || [];

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;

    const recentTasks = document.getElementById("recentTasks");

    recentTasks.innerHTML = "";

    if (tasks.length === 0) {
        recentTasks.textContent = "No tasks available yet.";
        return;
    }

    tasks.slice(-5).reverse().forEach(task => {
        const item = document.createElement("li");

        item.textContent =
            task.title + " - " +
            (task.completed ? "Completed" : "Pending");

        recentTasks.appendChild(item);
    });
}

updateDashboard();

// Logout functionality
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();

        localStorage.removeItem("taskhub_loggedInUser");

        alert("You have been logged out successfully.");

        window.location.href = "login.html";
    });
}
