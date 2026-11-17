
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

    const completed = tasks.filter(task =>
        task.status === "Completed" || (!task.status && task.completed)
    ).length;

    const pending = tasks.filter(task =>
        (task.status || (task.completed ? "Completed" : "Pending")) === "Pending"
    ).length;

    const inProgress = tasks.filter(task =>
        task.status === "In Progress"
    ).length;

    const today = new Date();
    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    const overdue = tasks.filter(task =>
        task.deadline &&
        task.deadline < todayString &&
        (task.status || (task.completed ? "Completed" : "Pending")) !== "Completed"
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("inProgressTasks").textContent = inProgress;

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
            (task.status || (task.completed ? "Completed" : "Pending"));

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
