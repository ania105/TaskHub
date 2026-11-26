
// TaskHub - AWS Connected Task Management

let tasks = [];
let searchQuery = "";
let editingTaskId = null;
let isLoading = false;

// Check Cognito login
if (!getAccessToken()) {
    alert("Please login first to access your tasks.");
    window.location.replace("login.html");
}

// Convert AWS dueAt into the value expected by the date/time input
function formatDeadline(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "";

    const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 16);
}

// Display tasks
function displayTasks() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task =>
        (task.title || "").toLowerCase().includes(searchQuery)
    );

    const sortInput = document.getElementById("sortPriority");
    const sortedTasks = [...filteredTasks];

    const priorityOrder = { High: 3, Medium: 2, Low: 1 };

    if (sortInput?.value === "high") {
        sortedTasks.sort((a, b) =>
            priorityOrder[b.priority] - priorityOrder[a.priority]
        );
    } else if (sortInput?.value === "low") {
        sortedTasks.sort((a, b) =>
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }

    if (sortedTasks.length === 0) {
        taskList.innerHTML = `
            <tr>
                <td colspan="5">
                    ${searchQuery
                        ? "No matching tasks found."
                        : "No tasks available yet."}
                </td>
            </tr>`;
        return;
    }

    sortedTasks.forEach(task => {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = task.title;

        const priorityCell = document.createElement("td");
        const priorityBadge = document.createElement("span");
        priorityBadge.textContent = task.priority || "Medium";
        priorityBadge.className =
            "priority-badge " +
            (task.priority || "Medium").toLowerCase();
        priorityCell.appendChild(priorityBadge);

        const deadlineCell = document.createElement("td");
        deadlineCell.textContent = task.dueAt
            ? new Date(task.dueAt).toLocaleString()
            : "Not set";

        const statusCell = document.createElement("td");
        statusCell.textContent = task.status || "Pending";

        const actionCell = document.createElement("td");

        const completeButton = document.createElement("button");
        completeButton.textContent =
            task.status === "Completed" ? "Undo" : "Complete";

        completeButton.addEventListener("click", async () => {
            const newStatus =
                task.status === "Completed" ? "Pending" : "Completed";

            await performTaskAction(async () => {
                await updateTask(task.taskId, { status: newStatus });
                await loadTasks();
            });
        });

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editingTaskId = task.taskId;

            document.getElementById("taskTitle").value =
                task.title || "";

            document.getElementById("description").value =
                task.description || "";

            document.getElementById("priority").value =
                task.priority || "Medium";

            document.getElementById("status").value =
                task.status || "Pending";

            document.getElementById("deadline").value =
                formatDeadline(task.dueAt);

            document.getElementById("submitTaskButton").textContent =
                "Update Task";

            document.getElementById("cancelEditButton").style.display =
                "inline-block";

            document.getElementById("taskTitle").focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete this task?")) {
                return;
            }

            await performTaskAction(async () => {
                await deleteTask(task.taskId);
                await loadTasks();
            });
        });

        actionCell.append(
            completeButton,
            editButton,
            deleteButton
        );

        row.append(
            titleCell,
            priorityCell,
            deadlineCell,
            statusCell,
            actionCell
        );

        taskList.appendChild(row);
    });
}

// Load tasks from AWS
async function loadTasks() {
    if (isLoading) return;

    isLoading = true;

    try {
        tasks = await getTasks();
        displayTasks();
    } catch (error) {
        console.error("Unable to load tasks:", error);
        alert("Unable to load tasks from AWS: " + error.message);
    } finally {
        isLoading = false;
    }
}

// Handle task operations and errors
async function performTaskAction(action) {
    try {
        await action();
    } catch (error) {
        console.error("Task operation failed:", error);
        alert("Task operation failed: " + error.message);
    }
}

// Search
const searchInput = document.getElementById("searchTask");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        searchQuery = searchInput.value.toLowerCase().trim();
        displayTasks();
    });
}

// Priority sorting
const sortInput = document.getElementById("sortPriority");

if (sortInput) {
    sortInput.addEventListener("change", displayTasks);
}

// Add or update task
const taskForm = document.getElementById("taskForm");

if (taskForm) {
    taskForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const title =
            document.getElementById("taskTitle").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const priority =
            document.getElementById("priority").value;

        const status =
            document.getElementById("status").value;

        const deadline =
            document.getElementById("deadline").value;

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const taskData = {
            title,
            description,
            priority,
            status,
            dueAt: deadline
                ? new Date(deadline).toISOString()
                : ""
        };

        await performTaskAction(async () => {
            if (editingTaskId) {
                await updateTask(editingTaskId, taskData);
                alert("Task updated successfully!");
            } else {
                await createTask(taskData);
                alert("Task added successfully!");
            }

            editingTaskId = null;
            taskForm.reset();

            document.getElementById("submitTaskButton").textContent =
                "Add Task";

            document.getElementById("cancelEditButton").style.display =
                "none";

            await loadTasks();
        });
    });
}

// Cancel editing
const cancelEditButton =
    document.getElementById("cancelEditButton");

if (cancelEditButton) {
    cancelEditButton.addEventListener("click", function() {
        editingTaskId = null;

        taskForm.reset();

        document.getElementById("submitTaskButton").textContent =
            "Add Task";

        cancelEditButton.style.display = "none";
    });
}

// Initial load
if (getAccessToken()) {
    loadTasks();
}
