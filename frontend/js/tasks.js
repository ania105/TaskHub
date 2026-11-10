
// TaskHub - Task Management Functionality
// Check whether a user is logged in
// TaskHub - Task Management Functionality

// Check whether a user is logged in
const loggedInUser = JSON.parse(
    localStorage.getItem("taskhub_loggedInUser")
);

if (!loggedInUser) {
    alert("Please login first to access your tasks.");
    window.location.href = "login.html";
}

// Create a separate storage key for each user
const tasksStorageKey = loggedInUser
    ? `taskhub_tasks_${loggedInUser.email}`
    : "taskhub_tasks";

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem(tasksStorageKey));

if (tasks === null) {
    tasks = JSON.parse(localStorage.getItem("taskhub_tasks")) || [];

    localStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
}

// Search query
let searchQuery = "";

// Track the task currently being edited
let editingIndex = -1;

// Save tasks
function saveTasks() {
    localStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
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


        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editingIndex = index;

            document.getElementById("taskTitle").value = task.title;
            document.getElementById("description").value = task.description || "";
            document.getElementById("priority").value = task.priority;
            document.getElementById("deadline").value = task.deadline || "";

            document.getElementById("submitTaskButton").textContent = "Update Task";
            document.getElementById("cancelEditButton").style.display = "inline-block";

            document.getElementById("taskTitle").focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        actionCell.append(completeButton, editButton, deleteButton);

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

// Add or update a task
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

        if (editingIndex !== -1) {
            // Update existing task
            tasks[editingIndex].title = title;
            tasks[editingIndex].description = description;
            tasks[editingIndex].priority = priority;
            tasks[editingIndex].deadline = deadline;

            alert("Task updated successfully!");
        } else {
            // Add new task
            const newTask = {
                title,
                description,
                priority,
                deadline,
                completed: false
            };

            tasks.push(newTask);

            alert("Task added successfully!");
        }

        editingIndex = -1;
        saveTasks();
        taskForm.reset();
        displayTasks();

        document.getElementById("submitTaskButton").textContent = "Add Task";
        document.getElementById("cancelEditButton").style.display = "none";
    });
}

// Cancel editing
const cancelEditButton = document.getElementById("cancelEditButton");

if (cancelEditButton) {
    cancelEditButton.addEventListener("click", function() {
        editingIndex = -1;
        taskForm.reset();

        document.getElementById("submitTaskButton").textContent = "Add Task";
        cancelEditButton.style.display = "none";
    });
}


// Display saved tasks when page loads
displayTasks();
