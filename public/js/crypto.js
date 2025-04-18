// Crypto investments JavaScript for fetching and displaying crypto data

document.addEventListener('DOMContentLoaded', function() {
    // Fetch all crypto investments
    fetchCryptoInvestments();
    
    // Set up event listeners
    document.getElementById('saveCryptoBtn').addEventListener('click', saveCryptoInvestment);
    document.getElementById('updateCryptoBtn').addEventListener('click', updateCryptoInvestment);
    document.getElementById('deleteCryptoBtn').addEventListener('click', deleteCryptoInvestment);
    
    // Toggle staking fields visibility
    document.getElementById('cryptoStakingEnabled').addEventListener('change', function() {
        const stakingFields = document.querySelectorAll('.staking-fields');
        stakingFields.forEach(field => {
            field.style.display = this.checked ? 'block' : 'none';
        });
    });
    
    // Toggle edit staking fields visibility
    document.getElementById('editCryptoStakingEnabled').addEventListener('change', function() {
        const stakingFields = document.querySelectorAll('.edit-staking-fields');
        stakingFields.forEach(field => {
            field.style.display = this.checked ? 'block' : 'none';
        });
    });
});

// Global variable to store all crypto investments
let allCryptoInvestments = [];

// Fetch all crypto investments
function fetchCryptoInvestments() {
    fetch('/api/crypto')
        .then(response => response.json())
        .then(data => {
            allCryptoInvestments = data.investments || [];
            displayPortfolioSummary(data.summary);
            displayStakingRewards(data.investments);
            displayCryptoList(data.investments);
            displayProfitAnalytics(data);
        })
        .catch(error => {
            console.error('Error fetching crypto investments:', error);
            document.getElementById('portfolioSummary').innerHTML = '<p class="text-danger">Error loading crypto data</p>';
        });
}

// Display portfolio summary
function displayPortfolioSummary(summary) {
    const container = document.getElementById('portfolioSummary');
    
    if (!summary) {
        container.innerHTML = '<p class="text-center">No portfolio data available</p>';
        return;
    }
    
    const totalInvestment = summary.totalInvestment || 0;
    const totalCurrentValue = summary.totalCurrentValue || 0;
    const totalProfit = summary.totalProfit || 0;
    const overallProfitPercentage = summary.overallProfitPercentage || 0;
    
    const profitClass = totalProfit >= 0 ? 'profit' : 'loss';
    const profitSign = totalProfit >= 0 ? '+' : '';
    
    let html = `
        <div class="row mb-3">
            <div class="col-6">
                <div class="border rounded p-3 text-center">
                    <h6 class="mb-1">Total Investment</h6>
                    <h4>$${totalInvestment.toFixed(2)}</h4>
                </div>
            </div>
            <div class="col-6">
                <div class="border rounded p-3 text-center">
                    <h6 class="mb-1">Current Value</h6>
                    <h4>$${totalCurrentValue.toFixed(2)}</h4>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-6">
                <div class="border rounded p-3 text-center">
                    <h6 class="mb-1">Total Profit/Loss</h6>
                    <h4 class="${profitClass}">${profitSign}$${Math.abs(totalProfit).toFixed(2)}</h4>
                </div>
            </div>
            <div class="col-6">
                <div class="border rounded p-3 text-center">
                    <h6 class="mb-1">ROI</h6>
                    <h4 class="${profitClass}">${profitSign}${overallProfitPercentage.toFixed(2)}%</h4>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Display staking rewards
function displayStakingRewards(investments) {
    const container = document.getElementById('stakingRewards');
    
    if (!investments || investments.length === 0) {
        container.innerHTML = '<p class="text-center">No staking data available</p>';
        return;
    }
    
    // Filter investments with staking enabled
    const stakingInvestments = investments.filter(investment => investment.stakingEnabled);
    
    if (stakingInvestments.length === 0) {
        container.innerHTML = '<p class="text-center">No staking rewards found</p>';
        return;
    }
    
    // Calculate total staking rewards
    const totalStakingRewards = stakingInvestments.reduce((sum, investment) => sum + investment.stakingRewards, 0);
    
    let html = `
        <div class="mb-3 text-center">
            <h4 class="profit">$${totalStakingRewards.toFixed(2)}</h4>
            <p>Total Staking Rewards</p>
        </div>
        
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>APR</th>
                        <th>Rewards</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    stakingInvestments.forEach(investment => {
        html += `
            <tr>
                <td>${investment.token}</td>
                <td>${investment.stakingAPR.toFixed(2)}%</td>
                <td class="profit">$${investment.stakingRewards.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Display crypto list
function displayCryptoList(investments) {
    const container = document.getElementById('cryptoList');
    
    if (!investments || investments.length === 0) {
        container.innerHTML = '<p class="text-center">No crypto investments found</p>';
        return;
    }
    
    // Sort investments by current value (highest first)
    const sortedInvestments = [...investments].sort((a, b) => b.currentValue - a.currentValue);
    
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += `
        <thead>
            <tr>
                <th>Token</th>
                <th>Amount</th>
                <th>Purchase Price</th>
                <th>Current Price</th>
                <th>Current Value</th>
                <th>Profit/Loss</th>
                <th>ROI</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    sortedInvestments.forEach(investment => {
        const profitClass = investment.profitLossPercentage >= 0 ? 'profit' : 'loss';
        const profitSign = investment.profitLossPercentage >= 0 ? '+' : '';
        
        html += `
            <tr data-id="${investment._id}">
                <td><strong>${investment.token}</strong></td>
                <td>${investment.amount.toFixed(6)}</td>
                <td>$${investment.purchasePrice.toFixed(2)}</td>
                <td>$${investment.currentPrice.toFixed(2)}</td>
                <td>$${investment.currentValue.toFixed(2)}</td>
                <td class="${profitClass}">${profitSign}$${Math.abs(investment.profitLoss).toFixed(2)}</td>
                <td class="${profitClass}">${profitSign}${investment.profitLossPercentage.toFixed(2)}%</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-crypto-btn" data-id="${investment._id}">Edit</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-crypto-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const investmentId = this.getAttribute('data-id');
            openEditCryptoModal(investmentId);
        });
    });
    
    // Add event listeners to table rows
    document.querySelectorAll('#cryptoList tbody tr').forEach(row => {
        row.addEventListener('click', function() {
            const investmentId = this.getAttribute('data-id');
            openEditCryptoModal(investmentId);
        });
    });
}

// Display profit analytics
function displayProfitAnalytics(data) {
    const container = document.getElementById('profitAnalytics');
    
    if (!data.investments || data.investments.length === 0) {
        container.innerHTML = '<p class="text-center">No data available for analytics</p>';
        return;
    }
    
    const investments = data.investments;
    const summary = data.summary;
    
    // Create profit breakdown chart
    let html = `
        <div class="row">
            <div class="col-md-6">
                <h5>Profit Breakdown</h5>
                <canvas id="profitBreakdownChart" height="250"></canvas>
            </div>
            <div class="col-md-6">
                <h5>Portfolio Composition</h5>
                <canvas id="portfolioCompositionChart" height="250"></canvas>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Create profit breakdown chart
    const profitBreakdownCtx = document.getElementById('profitBreakdownChart').getContext('2d');
    
    const marketGains = summary.totalProfitLoss || 0;
    const stakingRewards = summary.totalStakingRewards || 0;
    
    new Chart(profitBreakdownCtx, {
        type: 'pie',
        data: {
            labels: ['Market Gains/Losses', 'Staking Rewards'],
            datasets: [{
                data: [marketGains, stakingRewards],
                backgroundColor: [
                    marketGains >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)',
                    'rgba(0, 123, 255, 0.7)'
                ],
                borderColor: [
                    marketGains >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)',
                    'rgba(0, 123, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `$${Math.abs(value).toFixed(2)} (${(Math.abs(value) / Math.abs(summary.totalProfit) * 100).toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Create portfolio composition chart
    const portfolioCompositionCtx = document.getElementById('portfolioCompositionChart').getContext('2d');
    
    // Group small investments as "Other"
    const threshold = summary.totalCurrentValue * 0.05; // 5% threshold
    const groupedInvestments = [];
    let otherValue = 0;
    
    investments.forEach(investment => {
        if (investment.currentValue >= threshold) {
            groupedInvestments.push(investment);
        } else {
            otherValue += investment.currentValue;
        }
    });
    
    if (otherValue > 0) {
        groupedInvestments.push({
            token: 'Other',
            currentValue: otherValue
        });
    }
    
    const labels = groupedInvestments.map(investment => investment.token);
    const values = groupedInvestments.map(investment => investment.currentValue);
    
    new Chart(portfolioCompositionCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(0, 123, 255, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(23, 162, 184, 0.7)',
                    'rgba(111, 66, 193, 0.7)',
                    'rgba(102, 16, 242, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `$${value.toFixed(2)} (${(value / summary.totalCurrentValue * 100).toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Save new crypto investment
function saveCryptoInvestment() {
    const token = document.getElementById('cryptoToken').value;
    const amount = parseFloat(document.getElementById('cryptoAmount').value);
    const purchasePrice = parseFloat(document.getElementById('cryptoPurchasePrice').value);
    const currentPrice = parseFloat(document.getElementById('cryptoCurrentPrice').value);
    const purchaseDate = document.getElementById('cryptoPurchaseDate').value;
    const stakingEnabled = document.getElementById('cryptoStakingEnabled').checked;
    const stakingAPR = stakingEnabled ? parseFloat(document.getElementById('cryptoStakingAPR').value) : 0;
    const stakingRewards = stakingEnabled ? parseFloat(document.getElementById('cryptoStakingRewards').value) : 0;
    const notes = document.getElementById('cryptoNotes').value;
    
    if (!token || isNaN(amount) || isNaN(purchasePrice) || isNaN(currentPrice) || !purchaseDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newInvestment = {
        token,
        amount,
        purchasePrice,
        currentPrice,
        purchaseDate,
        stakingEnabled,
        stakingAPR,
        stakingRewards,
        notes
    };
    
    fetch('/api/crypto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newInvestment)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCryptoModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addCryptoForm').reset();
        document.querySelectorAll('.staking-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // Refresh crypto investments
        fetchCryptoInvestments();
    })
    .catch(error => {
        console.error('Error adding crypto investment:', error);
        alert('Error adding crypto investment. Please try again.');
    });
}

// Open edit crypto modal
function openEditCryptoModal(investmentId) {
    const investment = allCryptoInvestments.find(inv => inv._id === investmentId);
    
    if (!investment) {
        console.error('Investment not found');
        return;
    }
    
    // Populate form fields
    document.getElementById('editCryptoId').value = investment._id;
    document.getElementById('editCryptoToken').value = investment.token;
    document.getElementById('editCryptoAmount').value = investment.amount;
    document.getElementById('editCryptoPurchasePrice').value = investment.purchasePrice;
    document.getElementById('editCryptoCurrentPrice').value = investment.currentPrice;
    document.getElementById('editCryptoStakingEnabled').checked = investment.stakingEnabled;
    document.getElementById('editCryptoStakingAPR').value = investment.stakingAPR || 0;
    document.getElementById('editCryptoStakingRewards').value = investment.stakingRewards || 0;
    document.getElementById('editCryptoNotes').value = investment.notes || '';
    
    // Format date for input field (YYYY-MM-DD)
    if (investment.purchaseDate) {
        const date = new Date(investment.purchaseDate);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('editCryptoPurchaseDate').value = formattedDate;
    } else {
        document.getElementById('editCryptoPurchaseDate').value = '';
    }
    
    // Show/hide staking fields
    document.querySelectorAll('.edit-staking-fields').forEach(field => {
        field.style.display = investment.stakingEnabled ? 'block' : 'none';
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editCryptoModal'));
    modal.show();
}

// Update crypto investment
function updateCryptoInvestment() {
    const investmentId = document.getElementById('editCryptoId').value;
    const token = document.getElementById('editCryptoToken').value;
    const amount = parseFloat(document.getElementById('editCryptoAmount').value);
    const purchasePrice = parseFloat(document.getElementById('editCryptoPurchasePrice').value);
    const currentPrice = parseFloat(document.getElementById('editCryptoCurrentPrice').value);
    const purchaseDate = document.getElementById('editCryptoPurchaseDate').value;
    const stakingEnabled = document.getElementById('editCryptoStakingEnabled').checked;
    const stakingAPR = stakingEnabled ? parseFloat(document.getElementById('editCryptoStakingAPR').value) : 0;
    const stakingRewards = stakingEnabled ? parseFloat(document.getElementById('editCryptoStakingRewards').value) : 0;
    const notes = document.getElementById('editCryptoNotes').value;
    
    if (!token || isNaN(amount) || isNaN(purchasePrice) || isNaN(currentPrice) || !purchaseDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    const updatedInvestment = {
        token,
        amount,
        purchasePrice,
        currentPrice,
        purchaseDate,
        stakingEnabled,
        stakingAPR,
        stakingRewards,
        notes
    };
    
    fetch(`/api/crypto/${investmentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedInvestment)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCryptoModal'));
        modal.hide();
        
        // Refresh crypto investments
        fetchCryptoInvestments();
    })
    .catch(error => {
        console.error('Error updating crypto investment:', error);
        alert('Error updating crypto investment. Please try again.');
    });
}

// Delete crypto investment
function deleteCryptoInvestment() {
    const investmentId = document.getElementById('editCryptoId').value;
    
    if (confirm('Are you sure you want to delete this crypto investment?')) {
        fetch(`/api/crypto/${investmentId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCryptoModal'));
            modal.hide();
            
            // Refresh crypto investments
            fetchCryptoInvestments();
        })
        .catch(error => {
            console.error('Error deleting crypto investment:', error);
            alert('Error deleting crypto investment. Please try again.');
        });
    }
}
