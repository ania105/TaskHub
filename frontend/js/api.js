
const API_BASE_URL =
    "https://gdtvm6qbh2.execute-api.ap-south-1.amazonaws.com/prod";

// Get the current Cognito access token
function getAccessToken() {
    return sessionStorage.getItem("taskhub_access_token");
}

// Send an authenticated request to API Gateway
async function apiRequest(path, options = {}) {
    const token = getAccessToken();

    if (!token) {
        window.location.href = "login.html";
        throw new Error("Your session has expired. Please log in again.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || result.error || "AWS API request failed."
        );
    }

    return result;
}

// Retrieve all tasks belonging to the logged-in user
async function getTasks() {
    const result = await apiRequest("/tasks");
    return result.tasks || [];
}

// Create a task
async function createTask(task) {
    return apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(task)
    });
}

// Update a task
async function updateTask(taskId, updates) {
    return apiRequest(`/tasks/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
    });
}

// Delete a task
async function deleteTask(taskId) {
    return apiRequest(`/tasks/${encodeURIComponent(taskId)}`, {
        method: "DELETE"
    });
}
