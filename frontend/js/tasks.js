
// TaskHub - Task Management Functionality

// Load saved tasks from browser storage
let tasks = JSON.parse(localStorage.getItem("taskhub_tasks")) || [];

// Search query
let searchQuery = "";

// Save tasks
function saveTasks() {
    localStorage.setItem("taskhub_tasks", JSON.stringify(tasks));
}

// Display tasks
function displayTasks() {
    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML =
            '<tr><td colspan="5">No tasks available yet.</td></tr>';
        return;
    }

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery)
    );

    // Sort tasks by priority
const sortInput = document.getElementById("sortPriority");

let sortedTasks = [...filteredTasks];

if (sortInput && sortInput.value === "high") {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };

    sortedTasks.sort((a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority]
    );
}

if (sortInput && sortInput.value === "low") {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };

    sortedTasks.sort((a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority]
    );
}

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<tr><td colspan="5">No matching tasks found.</td></tr>';
        return;
    }

    sortedTasks.forEach(task => {
        const index = tasks.indexOf(task);
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = task.title;

        const priorityCell = document.createElement("td");

        const priorityBadge = document.createElement("span");
        priorityBadge.textContent = task.priority;
        priorityBadge.className =
            "priority-badge " + task.priority.toLowerCase();

        priorityCell.appendChild(priorityBadge);

        const deadlineCell = document.createElement("td");
        deadlineCell.textContent = task.deadline || "Not set";

        const statusCell = document.createElement("td");
        statusCell.textContent = task.completed
            ? "Completed"
            : "Pending";

        const actionCell = document.createElement("td");

        const completeButton = document.createElement("button");
        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            displayTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        actionCell.append(completeButton, deleteButton);

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

// Search tasks by title
const searchInput = document.getElementById("searchTask");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        searchQuery = searchInput.value.toLowerCase().trim();
        displayTasks();
    });
}
// Sort tasks when dropdown selection changes
const sortInput = document.getElementById("sortPriority");

if (sortInput) {
    sortInput.addEventListener("change", function() {
        displayTasks();
    });
}
// Add a new task
const taskForm = document.getElementById("taskForm");

if (taskForm) {
    taskForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = document.getElementById("taskTitle").value.trim();
        const description =
            document.getElementById("description").value.trim();
        const priority = document.getElementById("priority").value;
        const deadline = document.getElementById("deadline").value;

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const newTask = {
            title,
            description,
            priority,
            deadline,
            completed: false
        };

        tasks.push(newTask);

        saveTasks();
        displayTasks();

        taskForm.reset();
        alert("Task added successfully!");
    });
}

// Display saved tasks when page loads
displayTasks();
