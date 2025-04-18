// Dashboard JavaScript for fetching and displaying data

document.addEventListener('DOMContentLoaded', function() {
    // Fetch high priority tasks
    fetchHighPriorityTasks();
    
    // Fetch reading progress
    fetchReadingProgress();
    
    // Fetch inventory status
    fetchInventoryStatus();
    
    // Fetch real estate summary
    fetchRealEstateSummary();
    
    // Fetch crypto summary
    fetchCryptoSummary();
    
    // Fetch financial summary
    fetchFinancialSummary();
});

// Fetch high priority tasks
function fetchHighPriorityTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(data => {
            const highPriorityTasks = data.filter(task => task.priority === 'High' && task.status !== 'Done');
            displayHighPriorityTasks(highPriorityTasks.slice(0, 5)); // Display top 5
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            document.getElementById('high-priority-tasks').innerHTML = '<p class="text-danger">Error loading tasks</p>';
        });
}

// Display high priority tasks
function displayHighPriorityTasks(tasks) {
    const container = document.getElementById('high-priority-tasks');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="text-success">No high priority tasks pending!</p>';
        return;
    }
    
    let html = '<ul class="list-group">';
    
    tasks.forEach(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-danger me-2">High</span>
                    ${task.task}
                    <small class="text-muted d-block">${task.category}</small>
                </div>
                <span class="badge bg-secondary">${dueDate}</span>
            </li>
        `;
    });
    
    html += '</ul>';
    container.innerHTML = html;
}

// Fetch reading progress
function fetchReadingProgress() {
    fetch('/api/reading')
        .then(response => response.json())
        .then(data => {
            displayReadingProgress(data);
        })
        .catch(error => {
            console.error('Error fetching reading list:', error);
            document.getElementById('reading-progress').innerHTML = '<p class="text-danger">Error loading reading progress</p>';
        });
}

// Display reading progress
function displayReadingProgress(books) {
    const container = document.getElementById('reading-progress');
    
    const totalBooks = books.length;
    const completedBooks = books.filter(book => book.status === 'Completed').length;
    const currentlyReading = books.find(book => book.status === 'Currently Reading');
    
    let html = `
        <div class="mb-3">
            <h6>Goal: 20 books this year</h6>
            <div class="progress">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${(completedBooks / 20) * 100}%" 
                    aria-valuenow="${completedBooks}" aria-valuemin="0" aria-valuemax="20">
                    ${completedBooks}/20
                </div>
            </div>
            <small class="text-muted">${completedBooks} books completed</small>
        </div>
    `;
    
    if (currentlyReading) {
        html += `
            <div class="mt-3">
                <h6>Currently Reading:</h6>
                <div class="book-item">
                    <strong>${currentlyReading.title}</strong>
                    ${currentlyReading.author ? `<small class="text-muted d-block">by ${currentlyReading.author}</small>` : ''}
                    <div class="progress mt-2">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${currentlyReading.progress}%" 
                            aria-valuenow="${currentlyReading.progress}" aria-valuemin="0" aria-valuemax="100">
                            ${currentlyReading.progress}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        html += '<p>No book currently being read</p>';
    }
    
    container.innerHTML = html;
}

// Fetch inventory status
function fetchInventoryStatus() {
    fetch('/api/inventory')
        .then(response => response.json())
        .then(data => {
            displayInventoryStatus(data.items);
        })
        .catch(error => {
            console.error('Error fetching inventory:', error);
            document.getElementById('inventory-status').innerHTML = '<p class="text-danger">Error loading inventory</p>';
        });
}

// Display inventory status
function displayInventoryStatus(items) {
    const container = document.getElementById('inventory-status');
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p>No inventory items found</p>';
        return;
    }
    
    // Find items that need reordering
    const reorderItems = items.filter(item => 
        item.totalInventory <= item.reorderPoint && item.reorderPoint > 0
    );
    
    let html = '';
    
    if (reorderItems.length > 0) {
        html += '<h6 class="text-danger">Items to Reorder:</h6><ul class="list-group">';
        
        reorderItems.forEach(item => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${item.name}</strong>
                        <small class="text-muted d-block">SKU: ${item.sku}</small>
                    </div>
                    <span class="badge bg-danger">${item.totalInventory} in stock</span>
                </li>
            `;
        });
        
        html += '</ul>';
    } else {
        html += '<p class="text-success">All inventory levels are sufficient</p>';
    }
    
    // Add total inventory summary
    html += '<div class="mt-3"><h6>Inventory Summary:</h6>';
    
    const totalInventory = items.reduce((sum, item) => sum + item.totalInventory, 0);
    const totalFBA = items.reduce((sum, item) => sum + item.inventory.fba, 0);
    const totalASDN = items.reduce((sum, item) => sum + item.inventory.asdn, 0);
    
    html += `
        <div class="row">
            <div class="col-4 text-center">
                <div class="border rounded p-2">
                    <strong>${totalInventory}</strong>
                    <small class="d-block">Total</small>
                </div>
            </div>
            <div class="col-4 text-center">
                <div class="border rounded p-2">
                    <strong>${totalFBA}</strong>
                    <small class="d-block">FBA</small>
                </div>
            </div>
            <div class="col-4 text-center">
                <div class="border rounded p-2">
                    <strong>${totalASDN}</strong>
                    <small class="d-block">ASDN</small>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Fetch real estate summary
function fetchRealEstateSummary() {
    fetch('/api/properties')
        .then(response => response.json())
        .then(data => {
            displayRealEstateSummary(data);
        })
        .catch(error => {
            console.error('Error fetching properties:', error);
            document.getElementById('real-estate-summary').innerHTML = '<p class="text-danger">Error loading real estate data</p>';
        });
}

// Display real estate summary
function displayRealEstateSummary(data) {
    const container = document.getElementById('real-estate-summary');
    
    if (!data.properties || data.properties.length === 0) {
        container.innerHTML = '<p>No properties found</p>';
        return;
    }
    
    let html = `
        <div class="row mb-3">
            <div class="col-4 text-center">
                <div class="border rounded p-2">
                    <strong>$${Math.round(data.totalMonthlyRent).toLocaleString()}</strong>
                    <small class="d-block">Monthly Income</small>
                </div>
            </div>
            <div class="col-4 text-center">
                <div class="border rounded p-2">
                    <strong>$${Math.round(data.totalMonthlyExpenses).toLocaleString()}</strong>
                    <small class="d-block">Monthly Expenses</small>
                </div>
            </div>
            <div class="col-4 text-center">
                <div class="border rounded p-2 ${data.totalMonthlyNet >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}">
                    <strong>$${Math.round(data.totalMonthlyNet).toLocaleString()}</strong>
                    <small class="d-block">Monthly Net</small>
                </div>
            </div>
        </div>
    `;
    
    // Add expiring leases if any
    if (data.expiringLeases && data.expiringLeases.length > 0) {
        html += '<h6>Upcoming Lease Expirations:</h6><ul class="list-group">';
        
        data.expiringLeases.forEach(property => {
            const expirationDate = new Date(property.leaseExpiration).toLocaleDateString();
            
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${property.address}</strong>
                        ${property.unit ? `<small class="text-muted d-block">Unit: ${property.unit}</small>` : ''}
                    </div>
                    <span class="badge bg-warning text-dark">${expirationDate}</span>
                </li>
            `;
        });
        
        html += '</ul>';
    } else {
        html += '<p>No leases expiring in the next 90 days</p>';
    }
    
    container.innerHTML = html;
}

// Fetch crypto summary
function fetchCryptoSummary() {
    fetch('/api/crypto')
        .then(response => response.json())
        .then(data => {
            displayCryptoSummary(data);
        })
        .catch(error => {
            console.error('Error fetching crypto data:', error);
            document.getElementById('crypto-summary').innerHTML = '<p class="text-danger">Error loading crypto data</p>';
        });
}

// Display crypto summary
function displayCryptoSummary(data) {
    const container = document.getElementById('crypto-summary');
    
    if (!data.investments || data.investments.length === 0) {
        container.innerHTML = '<p>No crypto investments found</p>';
        return;
    }
    
    const summary = data.summary;
    
    let html = `
        <div class="row mb-3">
            <div class="col-6 text-center">
                <div class="border rounded p-2">
                    <strong>$${Math.round(summary.totalCurrentValue).toLocaleString()}</strong>
                    <small class="d-block">Portfolio Value</small>
                </div>
            </div>
            <div class="col-6 text-center">
                <div class="border rounded p-2 ${summary.totalProfit >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}">
                    <strong>$${Math.round(summary.totalProfit).toLocaleString()}</strong>
                    <small class="d-block">Total Profit</small>
                </div>
            </div>
        </div>
    `;
    
    // Add top performing tokens
    const sortedInvestments = [...data.investments].sort((a, b) => b.profitLossPercentage - a.profitLossPercentage);
    
    if (sortedInvestments.length > 0) {
        html += '<h6>Top Performers:</h6><ul class="list-group">';
        
        sortedInvestments.slice(0, 3).forEach(investment => {
            const profitClass = investment.profitLossPercentage >= 0 ? 'text-success' : 'text-danger';
            const profitSign = investment.profitLossPercentage >= 0 ? '+' : '';
            
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${investment.token}</strong>
                        <small class="text-muted d-block">$${investment.currentPrice.toFixed(2)}</small>
                    </div>
                    <span class="${profitClass}">${profitSign}${investment.profitLossPercentage.toFixed(2)}%</span>
                </li>
            `;
        });
        
        html += '</ul>';
    }
    
    container.innerHTML = html;
}

// Fetch financial summary
function fetchFinancialSummary() {
    fetch('/api/bookkeeping')
        .then(response => response.json())
        .then(data => {
            displayFinancialSummary(data);
        })
        .catch(error => {
            console.error('Error fetching bookkeeping data:', error);
            document.getElementById('financial-summary').innerHTML = '<p class="text-danger">Error loading financial data</p>';
        });
}

// Display financial summary
function displayFinancialSummary(data) {
    const container = document.getElementById('financial-summary');
    
    if (!data.entries || data.entries.length === 0) {
        container.innerHTML = '<p>No financial data found</p>';
        return;
    }
    
    const summary = data.summary;
    
    let html = `
        <div class="row mb-3">
            <div class="col-4 text-center">
                <div class="border rounded p-2 bg-success text-white">
                    <strong>$${Math.round(summary.totalIncome).toLocaleString()}</strong>
                    <small class="d-block">Income</small>
                </div>
            </div>
            <div class="col-4 text-center">
                <div class="border rounded p-2 bg-danger text-white">
                    <strong>$${Math.round(summary.totalExpenses).toLocaleString()}</strong>
                    <small class="d-block">Expenses</small>
                </div>
            </div>
            <div class="col-4 text-center">
                <div class="border rounded p-2 ${summary.netProfit >= 0 ? 'bg-primary text-white' : 'bg-warning text-dark'}">
                    <strong>$${Math.round(summary.netProfit).toLocaleString()}</strong>
                    <small class="d-block">Net Profit</small>
                </div>
            </div>
        </div>
    `;
    
    // Add business category breakdown
    if (summary.businessCategoryTotals) {
        html += '<h6>Business Categories:</h6>';
        html += '<div class="table-responsive"><table class="table table-sm">';
        html += '<thead><tr><th>Category</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead><tbody>';
        
        for (const [category, totals] of Object.entries(summary.businessCategoryTotals)) {
            const netClass = totals.net >= 0 ? 'text-success' : 'text-danger';
            
            html += `
                <tr>
                    <td>${category}</td>
                    <td>$${Math.round(totals.income).toLocaleString()}</td>
                    <td>$${Math.round(totals.expenses).toLocaleString()}</td>
                    <td class="${netClass}">$${Math.round(totals.net).toLocaleString()}</td>
                </tr>
            `;
        }
        
        html += '</tbody></table></div>';
    }
    
    container.innerHTML = html;
}
