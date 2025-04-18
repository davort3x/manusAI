// Bookkeeping JavaScript for managing financial transactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentEntries = [];
    let currentPage = 1;
    const entriesPerPage = 10;
    let totalPages = 1;
    
    // Set up event listeners
    document.getElementById('saveEntryBtn').addEventListener('click', saveEntry);
    document.getElementById('updateEntryBtn').addEventListener('click', updateEntry);
    document.getElementById('deleteEntryBtn').addEventListener('click', deleteEntry);
    document.getElementById('importEntriesBtn').addEventListener('click', importEntries);
    document.getElementById('applyFiltersBtn').addEventListener('click', fetchEntries);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('prevPageBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPageBtn').addEventListener('click', () => changePage(1));
    
    // Set default date values
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Fetch initial entries
    fetchEntries();
    
    // Fetch entries with optional filters
    function fetchEntries() {
        // Show loading spinner
        document.getElementById('entriesTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
        
        // Build query parameters
        const businessCategory = document.getElementById('businessCategoryFilter').value;
        const transactionType = document.getElementById('transactionTypeFilter').value;
        const startDate = document.getElementById('startDateFilter').value;
        const endDate = document.getElementById('endDateFilter').value;
        
        let queryParams = '';
        
        if (businessCategory) {
            queryParams += `businessCategory=${encodeURIComponent(businessCategory)}&`;
        }
        
        if (transactionType) {
            queryParams += `transactionType=${encodeURIComponent(transactionType)}&`;
        }
        
        if (startDate && endDate) {
            queryParams += `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&`;
        }
        
        // Remove trailing ampersand if exists
        if (queryParams.endsWith('&')) {
            queryParams = queryParams.slice(0, -1);
        }
        
        // Fetch entries from API
        fetch(`/api/bookkeeping${queryParams ? '?' + queryParams : ''}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store entries
                    currentEntries = data.entries;
                    
                    // Update summary
                    updateSummary(data.summary);
                    
                    // Update pagination
                    updatePagination();
                    
                    // Display entries
                    displayEntries();
                } else {
                    console.error('Error fetching bookkeeping entries:', data.message);
                    document.getElementById('entriesTableBody').innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center text-danger">
                                Error loading entries: ${data.message}
                            </td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching bookkeeping entries:', error);
                document.getElementById('entriesTableBody').innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            Error loading entries. Please try again.
                        </td>
                    </tr>
                `;
            });
    }
    
    // Update financial summary
    function updateSummary(summary) {
        if (!summary) return;
        
        document.getElementById('totalIncome').textContent = `$${summary.totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${summary.totalExpenses.toFixed(2)}`;
        
        const netProfit = summary.netProfit;
        const netProfitElement = document.getElementById('netProfit');
        
        netProfitElement.textContent = `$${Math.abs(netProfit).toFixed(2)}`;
        
        if (netProfit >= 0) {
            netProfitElement.classList.remove('text-danger');
            netProfitElement.classList.add('text-success');
        } else {
            netProfitElement.classList.remove('text-success');
            netProfitElement.classList.add('text-danger');
        }
    }
    
    // Update pagination controls
    function updatePagination() {
        totalPages = Math.ceil(currentEntries.length / entriesPerPage);
        
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        document.getElementById('entriesCount').textContent = currentEntries.length;
        document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        document.getElementById('prevPageBtn').disabled = currentPage <= 1;
        document.getElementById('nextPageBtn').disabled = currentPage >= totalPages;
    }
    
    // Change page
    function changePage(delta) {
        const newPage = currentPage + delta;
        
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            updatePagination();
            displayEntries();
        }
    }
    
    // Display entries for current page
    function displayEntries() {
        const tableBody = document.getElementById('entriesTableBody');
        
        if (currentEntries.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        No entries found. Add a new entry to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Calculate slice for current page
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = Math.min(startIndex + entriesPerPage, currentEntries.length);
        const pageEntries = currentEntries.slice(startIndex, endIndex);
        
        // Generate table rows
        let html = '';
        
        pageEntries.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            const typeClass = entry.transactionType === 'Income' ? 'text-success' : 'text-danger';
            const amountPrefix = entry.transactionType === 'Income' ? '+' : '-';
            
            html += `
                <tr data-id="${entry._id}">
                    <td>${date}</td>
                    <td class="${typeClass}">${entry.transactionType}</td>
                    <td>${entry.businessCategory}</td>
                    <td>${entry.category}</td>
                    <td>${entry.description}</td>
                    <td class="${typeClass}">${amountPrefix}$${entry.amount.toFixed(2)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary edit-entry-btn">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-entry-btn').forEach(button => {
            button.addEventListener('click', function() {
                const entryId = this.closest('tr').getAttribute('data-id');
                openEditModal(entryId);
            });
        });
    }
    
    // Save new entry
    function saveEntry() {
        // Validate form
        const form = document.getElementById('addEntryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form values
        const date = document.getElementById('date').value;
        const transactionType = document.getElementById('transactionType').value;
        const businessCategory = document.getElementById('businessCategory').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const paymentMethod = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('notes').value;
        
        // Create entry object
        const entry = {
            date,
            transactionType,
            businessCategory,
            category,
            description,
            amount,
            paymentMethod,
            notes
        };
        
        // Send to API
        fetch('/api/bookkeeping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addEntryModal'));
                modal.hide();
                
                // Reset form
                form.reset();
                document.getElementById('date').value = new Date().toISOString().split('T')[0];
                
                // Refresh entries
                fetchEntries();
                
                // Show success message
                alert('Entry added successfully');
            } else {
                alert('Error adding entry: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error adding entry:', error);
            alert('Error adding entry. Please try again.');
        });
    }
    
    // Open edit modal
    function openEditModal(entryId) {
        const entry = currentEntries.find(e => e._id === entryId);
        
        if (!entry) {
            console.error('Entry not found:', entryId);
            return;
        }
        
        // Set form values
        document.getElementById('editEntryId').value = entry._id;
        document.getElementById('editDate').value = new Date(entry.date).toISOString().split('T')[0];
        document.getElementById('editTransactionType').value = entry.transactionType;
        document.getElementById('editBusinessCategory').value = entry.businessCategory;
        document.getElementById('editCategory').value = entry.category;
        document.getElementById('editDescription').value = entry.description;
        document.getElementById('editAmount').value = entry.amount;
        document.getElementById('editPaymentMethod').value = entry.paymentMethod || '';
        document.getElementById('editNotes').value = entry.notes || '';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editEntryModal'));
        modal.show();
    }
    
    // Update entry
    function updateEntry() {
        // Validate form
        const form = document.getElementById('editEntryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form values
        const entryId = document.getElementById('editEntryId').value;
        const date = document.getElementById('editDate').value;
        const transactionType = document.getElementById('editTransactionType').value;
        const businessCategory = document.getElementById('editBusinessCategory').value;
        const category = document.getElementById('editCategory').value;
        const description = document.getElementById('editDescription').value;
        const amount = parseFloat(document.getElementById('editAmount').value);
        const paymentMethod = document.getElementById('editPaymentMethod').value;
        const notes = document.getElementById('editNotes').value;
        
        // Create entry object
        const entry = {
            date,
            transactionType,
            businessCategory,
            category,
            description,
            amount,
            paymentMethod,
            notes
        };
        
        // Send to API
        fetch(`/api/bookkeeping/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editEntryModal'));
                modal.hide();
                
                // Refresh entries
                fetchEntries();
                
                // Show success message
                alert('Entry updated successfully');
            } else {
                alert('Error updating entry: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating entry:', error);
            alert('Error updating entry. Please try again.');
        });
    }
    
    // Delete entry
    function deleteEntry() {
        const entryId = document.getElementById('editEntryId').value;
        
        if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            return;
        }
        
        // Send to API
        fetch(`/api/bookkeeping/${entryId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editEntryModal'));
                modal.hide();
                
                // Refresh entries
                fetchEntries();
                
                // Show success message
                alert('Entry deleted successfully');
            } else {
                alert('Error deleting entry: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            alert('Error deleting entry. Please try again.');
        });
    }
    
    // Import entries
    function importEntries() {
        const importData = document.getElementById('importData').value;
        
        if (!importData) {
            alert('Please enter import data');
            return;
        }
        
        let entries;
        
        try {
            entries = JSON.parse(importData);
            
            if (!Array.isArray(entries)) {
                throw new Error('Import data must be an array');
            }
        } catch (error) {
            alert('Invalid JSON format: ' + error.message);
            return;
        }
        
        // Send to API
        fetch('/api/bookkeeping/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entries })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('importEntriesModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('importData').value = '';
                
                // Refresh entries
                fetchEntries();
                
                // Show success message
                alert(`Successfully imported ${data.entries.length} entries`);
            } else {
                alert('Error importing entries: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error importing entries:', error);
            alert('Error importing entries. Please try again.');
        });
    }
    
    // Clear filters
    function clearFilters() {
        document.getElementById('businessCategoryFilter').value = '';
        document.getElementById('transactionTypeFilter').value = '';
        document.getElementById('startDateFilter').value = '';
        document.getElementById('endDateFilter').value = '';
        
        fetchEntries();
    }
});
