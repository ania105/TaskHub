
// TaskHub - Dynamic Dashboard

function updateDashboard() {
    const tasks = JSON.parse(
        localStorage.getItem("taskhub_tasks")
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
