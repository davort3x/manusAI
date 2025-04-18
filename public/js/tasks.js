// Tasks JavaScript for fetching and displaying tasks

document.addEventListener('DOMContentLoaded', function() {
    // Fetch all tasks
    fetchTasks();
    
    // Set up event listeners
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('priorityFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    
    // Add task form submission
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
    
    // Update task form submission
    document.getElementById('updateTaskBtn').addEventListener('click', updateTask);
    
    // Delete task button
    document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
});

// Global variable to store all tasks
let allTasks = [];

// Fetch all tasks
function fetchTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(data => {
            allTasks = data;
            displayTasks(allTasks);
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            document.getElementById('tasksList').innerHTML = '<p class="text-danger">Error loading tasks</p>';
        });
}

// Display tasks
function displayTasks(tasks) {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="text-center">No tasks found</p>';
        return;
    }
    
    let html = '';
    
    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'To Do');
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
    const waitingTasks = tasks.filter(task => task.status === 'Waiting');
    const doneTasks = tasks.filter(task => task.status === 'Done');
    
    // Display To Do tasks
    if (todoTasks.length > 0) {
        html += '<h5 class="mb-3">To Do</h5>';
        html += renderTaskList(todoTasks);
    }
    
    // Display In Progress tasks
    if (inProgressTasks.length > 0) {
        html += '<h5 class="mb-3 mt-4">In Progress</h5>';
        html += renderTaskList(inProgressTasks);
    }
    
    // Display Waiting tasks
    if (waitingTasks.length > 0) {
        html += '<h5 class="mb-3 mt-4">Waiting</h5>';
        html += renderTaskList(waitingTasks);
    }
    
    // Display Done tasks
    if (doneTasks.length > 0) {
        html += '<h5 class="mb-3 mt-4">Done</h5>';
        html += renderTaskList(doneTasks);
    }
    
    container.innerHTML = html;
    
    // Add event listeners to task items
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            openEditTaskModal(taskId);
        });
    });
    
    // Add event listeners to complete buttons
    document.querySelectorAll('.complete-task-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent task item click
            const taskId = this.getAttribute('data-id');
            markTaskComplete(taskId);
        });
    });
}

// Render task list
function renderTaskList(tasks) {
    let html = '<div class="list-group mb-3">';
    
    tasks.forEach(task => {
        const priorityClass = task.priority === 'High' ? 'high-priority' : 
                             task.priority === 'Medium' ? 'medium-priority' : 'low-priority';
        
        const completedClass = task.status === 'Done' ? 'completed' : '';
        
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        html += `
            <div class="task-item ${priorityClass} ${completedClass} d-flex justify-content-between align-items-start p-3 mb-2" data-id="${task._id}">
                <div>
                    <div class="d-flex align-items-center">
                        <span class="badge ${task.priority === 'High' ? 'bg-danger' : 
                                           task.priority === 'Medium' ? 'bg-warning text-dark' : 
                                           'bg-info text-dark'} me-2">${task.priority}</span>
                        <h6 class="mb-0">${task.task}</h6>
                    </div>
                    <small class="text-muted d-block">${task.category}</small>
                    <small class="text-muted d-block">Due: ${dueDate}</small>
                    ${task.notes ? `<small class="d-block mt-1">${task.notes}</small>` : ''}
                </div>
                <div>
                    ${task.status !== 'Done' ? 
                        `<button class="btn btn-sm btn-success complete-task-btn" data-id="${task._id}">
                            <i class="bi bi-check-circle"></i> Complete
                        </button>` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Apply filters
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredTasks = [...allTasks];
    
    if (categoryFilter) {
        filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
    }
    
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    displayTasks(filteredTasks);
}

// Save new task
function saveTask() {
    const taskName = document.getElementById('taskName').value;
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const status = document.getElementById('taskStatus').value;
    const notes = document.getElementById('taskNotes').value;
    
    if (!taskName || !category || !priority || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newTask = {
        task: taskName,
        category,
        priority,
        dueDate: dueDate || null,
        status,
        notes
    };
    
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addTaskForm').reset();
        
        // Refresh tasks
        fetchTasks();
    })
    .catch(error => {
        console.error('Error adding task:', error);
        alert('Error adding task. Please try again.');
    });
}

// Open edit task modal
function openEditTaskModal(taskId) {
    const task = allTasks.find(t => t._id === taskId);
    
    if (!task) {
        console.error('Task not found');
        return;
    }
    
    // Populate form fields
    document.getElementById('editTaskId').value = task._id;
    document.getElementById('editTaskName').value = task.task;
    document.getElementById('editTaskCategory').value = task.category;
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskStatus').value = task.status;
    document.getElementById('editTaskNotes').value = task.notes || '';
    
    // Format date for input field (YYYY-MM-DD)
    if (task.dueDate) {
        const date = new Date(task.dueDate);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('editTaskDueDate').value = formattedDate;
    } else {
        document.getElementById('editTaskDueDate').value = '';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
}

// Update task
function updateTask() {
    const taskId = document.getElementById('editTaskId').value;
    const taskName = document.getElementById('editTaskName').value;
    const category = document.getElementById('editTaskCategory').value;
    const priority = document.getElementById('editTaskPriority').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    const status = document.getElementById('editTaskStatus').value;
    const notes = document.getElementById('editTaskNotes').value;
    
    if (!taskName || !category || !priority || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const updatedTask = {
        task: taskName,
        category,
        priority,
        dueDate: dueDate || null,
        status,
        notes
    };
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        modal.hide();
        
        // Refresh tasks
        fetchTasks();
    })
    .catch(error => {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
    });
}

// Delete task
function deleteTask() {
    const taskId = document.getElementById('editTaskId').value;
    
    if (confirm('Are you sure you want to delete this task?')) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            modal.hide();
            
            // Refresh tasks
            fetchTasks();
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        });
    }
}

// Mark task as complete
function markTaskComplete(taskId) {
    fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH'
    })
    .then(response => response.json())
    .then(data => {
        // Refresh tasks
        fetchTasks();
    })
    .catch(error => {
        console.error('Error completing task:', error);
        alert('Error completing task. Please try again.');
    });
}
