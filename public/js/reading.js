// Reading list JavaScript for fetching and displaying books

document.addEventListener('DOMContentLoaded', function() {
    // Fetch all books
    fetchBooks();
    
    // Set up event listeners
    document.getElementById('saveBookBtn').addEventListener('click', saveBook);
    document.getElementById('updateBookBtn').addEventListener('click', updateBook);
    document.getElementById('deleteBookBtn').addEventListener('click', deleteBook);
    
    // Update progress bar when progress input changes
    document.getElementById('editBookProgress').addEventListener('input', function() {
        const progress = this.value;
        document.getElementById('editProgressBar').style.width = `${progress}%`;
        
        if (progress < 30) {
            document.getElementById('editProgressBar').className = 'progress-bar bg-danger';
        } else if (progress < 70) {
            document.getElementById('editProgressBar').className = 'progress-bar bg-warning';
        } else {
            document.getElementById('editProgressBar').className = 'progress-bar bg-success';
        }
    });
});

// Global variable to store all books
let allBooks = [];

// Fetch all books
function fetchBooks() {
    fetch('/api/reading')
        .then(response => response.json())
        .then(data => {
            allBooks = data;
            displayReadingGoal(data);
            displayCurrentlyReading(data);
            displayToReadList(data);
            displayCompletedList(data);
            displayAllBooks(data);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            document.getElementById('readingGoalProgress').innerHTML = '<p class="text-danger">Error loading reading data</p>';
        });
}

// Display reading goal progress
function displayReadingGoal(books) {
    const container = document.getElementById('readingGoalProgress');
    
    const completedBooks = books.filter(book => book.status === 'Completed');
    const completedCount = completedBooks.length;
    const goalCount = 20; // Annual reading goal
    
    const progressPercentage = Math.min((completedCount / goalCount) * 100, 100);
    
    let html = `
        <h6>Annual Reading Goal: ${completedCount}/${goalCount} books</h6>
        <div class="progress mb-3">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercentage}%" 
                aria-valuenow="${completedCount}" aria-valuemin="0" aria-valuemax="${goalCount}">
                ${Math.round(progressPercentage)}%
            </div>
        </div>
    `;
    
    // Add completion rate
    const currentMonth = new Date().getMonth();
    const expectedProgress = ((currentMonth + 1) / 12) * goalCount;
    const progressStatus = completedCount >= expectedProgress ? 'text-success' : 'text-danger';
    
    html += `
        <p class="${progressStatus}">
            ${completedCount >= expectedProgress ? 'On track' : 'Behind schedule'} 
            (Expected: ${Math.round(expectedProgress)} books by now)
        </p>
    `;
    
    container.innerHTML = html;
}

// Display currently reading books
function displayCurrentlyReading(books) {
    const container = document.getElementById('currentlyReading');
    
    const currentlyReading = books.filter(book => book.status === 'Currently Reading');
    
    if (currentlyReading.length === 0) {
        container.innerHTML = '<p class="text-center">No books currently being read</p>';
        return;
    }
    
    let html = '';
    
    currentlyReading.forEach(book => {
        let progressBarClass = 'bg-danger';
        if (book.progress >= 30 && book.progress < 70) {
            progressBarClass = 'bg-warning';
        } else if (book.progress >= 70) {
            progressBarClass = 'bg-success';
        }
        
        html += `
            <div class="book-item mb-3" data-id="${book._id}">
                <h6>${book.title}</h6>
                ${book.author ? `<small class="text-muted d-block">by ${book.author}</small>` : ''}
                <div class="progress mt-2">
                    <div class="progress-bar ${progressBarClass}" role="progressbar" style="width: ${book.progress}%" 
                        aria-valuenow="${book.progress}" aria-valuemin="0" aria-valuemax="100">
                        ${book.progress}%
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted">Started: ${book.startDate ? new Date(book.startDate).toLocaleDateString() : 'N/A'}</small>
                    <button class="btn btn-sm btn-primary update-progress-btn" data-id="${book._id}">Update Progress</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners to update progress buttons
    document.querySelectorAll('.update-progress-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            openEditBookModal(bookId);
        });
    });
    
    // Add event listeners to book items
    document.querySelectorAll('.book-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.classList.contains('update-progress-btn')) {
                const bookId = this.getAttribute('data-id');
                openEditBookModal(bookId);
            }
        });
    });
}

// Display to-read list
function displayToReadList(books) {
    const container = document.getElementById('toReadList');
    
    const toReadBooks = books.filter(book => book.status === 'To Read');
    
    if (toReadBooks.length === 0) {
        container.innerHTML = '<p class="text-center">No books in your to-read list</p>';
        return;
    }
    
    // Sort by priority
    const sortedBooks = [...toReadBooks].sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    let html = '<div class="list-group">';
    
    sortedBooks.forEach(book => {
        const priorityBadge = book.priority === 'High' ? 'bg-danger' : 
                             book.priority === 'Medium' ? 'bg-warning text-dark' : 
                             'bg-info text-dark';
        
        html += `
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-id="${book._id}">
                <div>
                    <h6 class="mb-1">${book.title}</h6>
                    ${book.author ? `<small class="text-muted">by ${book.author}</small>` : ''}
                </div>
                <div>
                    <span class="badge ${priorityBadge} me-2">${book.priority}</span>
                    <button class="btn btn-sm btn-success start-reading-btn" data-id="${book._id}">Start Reading</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners to start reading buttons
    document.querySelectorAll('.start-reading-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const bookId = this.getAttribute('data-id');
            startReading(bookId);
        });
    });
    
    // Add event listeners to book items
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            openEditBookModal(bookId);
        });
    });
}

// Display completed list
function displayCompletedList(books) {
    const container = document.getElementById('completedList');
    
    const completedBooks = books.filter(book => book.status === 'Completed');
    
    if (completedBooks.length === 0) {
        container.innerHTML = '<p class="text-center">No completed books</p>';
        return;
    }
    
    // Sort by completion date (most recent first)
    const sortedBooks = [...completedBooks].sort((a, b) => {
        return new Date(b.completionDate) - new Date(a.completionDate);
    });
    
    let html = '<div class="list-group">';
    
    sortedBooks.forEach(book => {
        const completionDate = book.completionDate ? new Date(book.completionDate).toLocaleDateString() : 'Unknown';
        
        html += `
            <div class="list-group-item list-group-item-action" data-id="${book._id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${book.title}</h6>
                    <small>Completed: ${completionDate}</small>
                </div>
                ${book.author ? `<small class="text-muted">by ${book.author}</small>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners to book items
    document.querySelectorAll('#completedList .list-group-item').forEach(item => {
        item.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            openEditBookModal(bookId);
        });
    });
}

// Display all books
function displayAllBooks(books) {
    const container = document.getElementById('allBooksList');
    
    if (books.length === 0) {
        container.innerHTML = '<p class="text-center">No books in your library</p>';
        return;
    }
    
    // Sort by title
    const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));
    
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += `
        <thead>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Priority</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    sortedBooks.forEach(book => {
        const statusClass = book.status === 'Completed' ? 'text-success' : 
                           book.status === 'Currently Reading' ? 'text-primary' : 
                           'text-secondary';
        
        const priorityClass = book.priority === 'High' ? 'text-danger' : 
                             book.priority === 'Medium' ? 'text-warning' : 
                             'text-info';
        
        html += `
            <tr data-id="${book._id}">
                <td>${book.title}</td>
                <td>${book.author || '-'}</td>
                <td class="${statusClass}">${book.status}</td>
                <td>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar ${book.progress >= 70 ? 'bg-success' : book.progress >= 30 ? 'bg-warning' : 'bg-danger'}" 
                            role="progressbar" style="width: ${book.progress}%" 
                            aria-valuenow="${book.progress}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <small>${book.progress}%</small>
                </td>
                <td class="${priorityClass}">${book.priority}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-book-btn" data-id="${book._id}">Edit</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-book-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const bookId = this.getAttribute('data-id');
            openEditBookModal(bookId);
        });
    });
    
    // Add event listeners to table rows
    document.querySelectorAll('#allBooksList tbody tr').forEach(row => {
        row.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            openEditBookModal(bookId);
        });
    });
}

// Save new book
function saveBook() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const priority = document.getElementById('bookPriority').value;
    const status = document.getElementById('bookStatus').value;
    const progress = document.getElementById('bookProgress').value;
    const notes = document.getElementById('bookNotes').value;
    
    if (!title || !priority || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newBook = {
        title,
        author,
        priority,
        status,
        progress: parseInt(progress) || 0,
        notes
    };
    
    // Set start date if status is "Currently Reading"
    if (status === 'Currently Reading') {
        newBook.startDate = new Date();
    }
    
    // Set completion date if status is "Completed"
    if (status === 'Completed') {
        newBook.completionDate = new Date();
        newBook.progress = 100;
    }
    
    fetch('/api/reading', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addBookForm').reset();
        
        // Refresh books
        fetchBooks();
    })
    .catch(error => {
        console.error('Error adding book:', error);
        alert('Error adding book. Please try again.');
    });
}

// Open edit book modal
function openEditBookModal(bookId) {
    const book = allBooks.find(b => b._id === bookId);
    
    if (!book) {
        console.error('Book not found');
        return;
    }
    
    // Populate form fields
    document.getElementById('editBookId').value = book._id;
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author || '';
    document.getElementById('editBookPriority').value = book.priority;
    document.getElementById('editBookStatus').value = book.status;
    document.getElementById('editBookProgress').value = book.progress || 0;
    document.getElementById('editBookNotes').value = book.notes || '';
    
    // Update progress bar
    const progress = book.progress || 0;
    document.getElementById('editProgressBar').style.width = `${progress}%`;
    
    if (progress < 30) {
        document.getElementById('editProgressBar').className = 'progress-bar bg-danger';
    } else if (progress < 70) {
        document.getElementById('editProgressBar').className = 'progress-bar bg-warning';
    } else {
        document.getElementById('editProgressBar').className = 'progress-bar bg-success';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editBookModal'));
    modal.show();
}

// Update book
function updateBook() {
    const bookId = document.getElementById('editBookId').value;
    const title = document.getElementById('editBookTitle').value;
    const author = document.getElementById('editBookAuthor').value;
    const priority = document.getElementById('editBookPriority').value;
    const status = document.getElementById('editBookStatus').value;
    const progress = document.getElementById('editBookProgress').value;
    const notes = document.getElementById('editBookNotes').value;
    
    if (!title || !priority || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const book = allBooks.find(b => b._id === bookId);
    const oldStatus = book.status;
    
    const updatedBook = {
        title,
        author,
        priority,
        status,
        progress: parseInt(progress) || 0,
        notes
    };
    
    // Set start date if status changed to "Currently Reading"
    if (status === 'Currently Reading' && oldStatus !== 'Currently Reading') {
        updatedBook.startDate = new Date();
    }
    
    // Set completion date if status changed to "Completed"
    if (status === 'Completed' && oldStatus !== 'Completed') {
        updatedBook.completionDate = new Date();
        updatedBook.progress = 100;
    }
    
    fetch(`/api/reading/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBook)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
        modal.hide();
        
        // Refresh books
        fetchBooks();
    })
    .catch(error => {
        console.error('Error updating book:', error);
        alert('Error updating book. Please try again.');
    });
}

// Delete book
function deleteBook() {
    const bookId = document.getElementById('editBookId').value;
    
    if (confirm('Are you sure you want to delete this book?')) {
        fetch(`/api/reading/${bookId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
            modal.hide();
            
            // Refresh books
            fetchBooks();
        })
        .catch(error => {
            console.error('Error deleting book:', error);
            alert('Error deleting book. Please try again.');
        });
    }
}

// Start reading a book
function startReading(bookId) {
    const book = allBooks.find(b => b._id === bookId);
    
    if (!book) {
        console.error('Book not found');
        return;
    }
    
    const updatedBook = {
        ...book,
        status: 'Currently Reading',
        startDate: new Date(),
        progress: book.progress > 0 ? book.progress : 1
    };
    
    fetch(`/api/reading/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBook)
    })
    .then(response => response.json())
    .then(data => {
        // Refresh books
        fetchBooks();
    })
    .catch(error => {
        console.error('Error updating book:', error);
        alert('Error updating book. Please try again.');
    });
}
