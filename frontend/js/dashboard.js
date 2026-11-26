
// TaskHub - AWS Connected Dashboard

// Cognito configuration
const COGNITO_DOMAIN =
    "https://ap-south-1ob6tzakyd.auth.ap-south-1.amazoncognito.com";

const CLIENT_ID = "5cei6e2oofai765ta7jbv9tk44";

const REDIRECT_URI = window.location.origin + window.location.pathname.replace("dashboard.html", "login.html");

// Check Cognito session
if (!getAccessToken()) {
    alert("Please login first to access TaskHub.");
    window.location.replace("login.html");
}

// Calculate and display dashboard statistics
function updateDashboard(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(task =>
        task.status === "Completed"
    ).length;

    const pending = tasks.filter(task =>
        task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(task =>
        task.status === "In Progress"
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(task => {
        if (!task.dueAt || task.status === "Completed") {
            return false;
        }

        const deadline = new Date(task.dueAt);

        return !isNaN(deadline.getTime()) &&
            deadline < today;
    }).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("inProgressTasks").textContent = inProgress;

    // Display five most recent tasks
    const recentTasks = document.getElementById("recentTasks");

    recentTasks.innerHTML = "";

    if (tasks.length === 0) {
        recentTasks.textContent = "No tasks available yet.";
        return;
    }

    const sortedTasks = [...tasks].sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    sortedTasks.slice(0, 5).forEach(task => {
        const item = document.createElement("li");

        item.textContent =
            `${task.title} - ${task.status || "Pending"}`;

        recentTasks.appendChild(item);
    });
}

// Fetch tasks from AWS and refresh dashboard
async function loadDashboard() {
    try {
        const tasks = await getTasks();
        updateDashboard(tasks);
    } catch (error) {
        console.error("Dashboard loading error:", error);
        alert("Unable to load your tasks from AWS. Please try again.");
    }
}

// Cognito logout
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();

        sessionStorage.removeItem("taskhub_access_token");
        sessionStorage.removeItem("taskhub_id_token");

        const logoutUrl =
            `${COGNITO_DOMAIN}/logout?` +
            new URLSearchParams({
                client_id: CLIENT_ID,
                logout_uri: REDIRECT_URI
            }).toString();

        window.location.replace(logoutUrl);
    });
}

// Load dashboard
if (getAccessToken()) {
    loadDashboard();
}
