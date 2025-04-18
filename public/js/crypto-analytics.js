// Crypto analytics JavaScript for fetching and displaying advanced analytics

document.addEventListener('DOMContentLoaded', function() {
    // Fetch crypto analytics
    fetchCryptoAnalytics();
    
    // Set up event listeners
    document.getElementById('updatePricesBtn').addEventListener('click', openUpdatePricesModal);
    document.getElementById('savePricesBtn').addEventListener('click', updatePrices);
});

// Fetch crypto analytics
function fetchCryptoAnalytics() {
    fetch('/api/crypto/analytics')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProfitBreakdown(data.analytics.summary);
                displayStakingEfficiency(data.analytics.stakingEfficiency);
                displayProfitByDuration(data.analytics.profitByDuration);
                displayTokenProfitContribution(data.analytics.tokenProfitContribution);
                displayPerformanceMetrics(data.analytics.summary);
                
                // Store token list for price updates
                window.tokenList = Object.keys(data.analytics.tokenProfitContribution);
            } else {
                console.error('Error fetching crypto analytics:', data.message);
                document.getElementById('profitBreakdown').innerHTML = '<p class="text-danger">Error loading analytics data</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching crypto analytics:', error);
            document.getElementById('profitBreakdown').innerHTML = '<p class="text-danger">Error loading analytics data</p>';
        });
}

// Display profit breakdown
function displayProfitBreakdown(summary) {
    const container = document.getElementById('profitBreakdown');
    
    if (!summary) {
        container.innerHTML = '<p class="text-center">No profit data available</p>';
        return;
    }
    
    const totalProfit = summary.totalProfit || 0;
    const marketGains = summary.totalProfitLoss || 0;
    const stakingRewards = summary.totalStakingRewards || 0;
    
    // Create profit breakdown chart
    container.innerHTML = '<canvas id="profitBreakdownChart" height="250"></canvas>';
    const ctx = document.getElementById('profitBreakdownChart').getContext('2d');
    
    new Chart(ctx, {
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
                            const percentage = totalProfit !== 0 ? (Math.abs(value) / Math.abs(totalProfit) * 100) : 0;
                            return `$${Math.abs(value).toFixed(2)} (${percentage.toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Add summary text
    const profitClass = totalProfit >= 0 ? 'text-success' : 'text-danger';
    const profitSign = totalProfit >= 0 ? '+' : '';
    
    const marketClass = marketGains >= 0 ? 'text-success' : 'text-danger';
    const marketSign = marketGains >= 0 ? '+' : '';
    
    const html = `
        <div class="mt-3">
            <h4 class="${profitClass}">${profitSign}$${Math.abs(totalProfit).toFixed(2)}</h4>
            <p>Total Profit/Loss</p>
            
            <div class="row mt-3">
                <div class="col-6">
                    <h5 class="${marketClass}">${marketSign}$${Math.abs(marketGains).toFixed(2)}</h5>
                    <p>Market Gains/Losses</p>
                </div>
                <div class="col-6">
                    <h5 class="text-primary">+$${stakingRewards.toFixed(2)}</h5>
                    <p>Staking Rewards</p>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML += html;
}

// Display staking efficiency
function displayStakingEfficiency(stakingEfficiency) {
    const container = document.getElementById('stakingEfficiency');
    
    if (!stakingEfficiency || Object.keys(stakingEfficiency).length === 0) {
        container.innerHTML = '<p class="text-center">No staking data available</p>';
        return;
    }
    
    // Create staking efficiency chart
    container.innerHTML = '<canvas id="stakingEfficiencyChart" height="250"></canvas>';
    const ctx = document.getElementById('stakingEfficiencyChart').getContext('2d');
    
    const tokens = Object.keys(stakingEfficiency);
    const effectiveAPRs = tokens.map(token => stakingEfficiency[token].effectiveAPR);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tokens,
            datasets: [{
                label: 'Effective APR (%)',
                data: effectiveAPRs,
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Effective APR (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Add staking efficiency table
    let html = `
        <div class="mt-3">
            <h5>Staking Efficiency by Token</h5>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Total Staked</th>
                            <th>Total Rewards</th>
                            <th>Effective APR</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    tokens.forEach(token => {
        const data = stakingEfficiency[token];
        html += `
            <tr>
                <td>${token}</td>
                <td>$${data.totalStaked.toFixed(2)}</td>
                <td>$${data.totalRewards.toFixed(2)}</td>
                <td>${data.effectiveAPR.toFixed(2)}%</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div>';
    container.innerHTML += html;
}

// Display profit by duration
function displayProfitByDuration(profitByDuration) {
    const container = document.getElementById('profitByDuration');
    
    if (!profitByDuration || Object.keys(profitByDuration).length === 0) {
        container.innerHTML = '<p class="text-center">No duration data available</p>';
        return;
    }
    
    // Create profit by duration chart
    container.innerHTML = '<canvas id="profitByDurationChart" height="250"></canvas>';
    const ctx = document.getElementById('profitByDurationChart').getContext('2d');
    
    const durationLabels = {
        'lessThan30Days': 'Less than 30 days',
        '30To90Days': '30-90 days',
        '90To180Days': '90-180 days',
        '180To365Days': '180-365 days',
        'moreThan365Days': 'More than 365 days'
    };
    
    const categories = Object.keys(profitByDuration);
    const rois = categories.map(category => profitByDuration[category].roi);
    const investments = categories.map(category => profitByDuration[category].totalInvestment);
    const profits = categories.map(category => profitByDuration[category].totalProfit);
    const labels = categories.map(category => durationLabels[category] || category);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ROI (%)',
                data: rois,
                backgroundColor: rois.map(roi => roi >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)'),
                borderColor: rois.map(roi => roi >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'),
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'Investment ($)',
                data: investments,
                type: 'line',
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'ROI (%)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Investment ($)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
    
    // Add profit by duration table
    let html = `
        <div class="mt-3">
            <h5>Profit by Investment Duration</h5>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Duration</th>
                            <th>Number of Investments</th>
                            <th>Total Investment</th>
                            <th>Total Profit</th>
                            <th>ROI</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    categories.forEach(category => {
        const data = profitByDuration[category];
        const roiClass = data.roi >= 0 ? 'text-success' : 'text-danger';
        const roiSign = data.roi >= 0 ? '+' : '';
        
        html += `
            <tr>
                <td>${durationLabels[category] || category}</td>
                <td>${data.count}</td>
                <td>$${data.totalInvestment.toFixed(2)}</td>
                <td>$${data.totalProfit.toFixed(2)}</td>
                <td class="${roiClass}">${roiSign}${data.roi.toFixed(2)}%</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div>';
    container.innerHTML += html;
}

// Display token profit contribution
function displayTokenProfitContribution(tokenProfitContribution) {
    const container = document.getElementById('tokenProfitContribution');
    
    if (!tokenProfitContribution || Object.keys(tokenProfitContribution).length === 0) {
        container.innerHTML = '<p class="text-center">No token profit data available</p>';
        return;
    }
    
    // Create token profit contribution chart
    container.innerHTML = '<canvas id="tokenProfitChart" height="250"></canvas>';
    const ctx = document.getElementById('tokenProfitChart').getContext('2d');
    
    const tokens = Object.keys(tokenProfitContribution);
    const marketGains = tokens.map(token => tokenProfitContribution[token].marketGains);
    const stakingRewards = tokens.map(token => tokenProfitContribution[token].stakingRewards);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tokens,
            datasets: [{
                label: 'Market Gains/Losses',
                data: marketGains,
                backgroundColor: marketGains.map(gain => gain >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)'),
                borderColor: marketGains.map(gain => gain >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'),
                borderWidth: 1
            }, {
                label: 'Staking Rewards',
                data: stakingRewards,
                backgroundColor: 'rgba(0, 123, 255, 0.7)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Profit/Loss ($)'
                    }
                }
            }
        }
    });
    
    // Add token profit contribution table
    let html = `
        <div class="mt-3">
            <h5>Profit Contribution by Token</h5>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Market Gains/Losses</th>
                            <th>Staking Rewards</th>
                            <th>Total Profit</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    tokens.forEach(token => {
        const data = tokenProfitContribution[token];
        const marketClass = data.marketGains >= 0 ? 'text-success' : 'text-danger';
        const marketSign = data.marketGains >= 0 ? '+' : '';
        const totalClass = data.totalProfit >= 0 ? 'text-success' : 'text-danger';
        const totalSign = data.totalProfit >= 0 ? '+' : '';
        
        html += `
            <tr>
                <td>${token}</td>
                <td class="${marketClass}">${marketSign}$${Math.abs(data.marketGains).toFixed(2)}</td>
                <td class="text-primary">+$${data.stakingRewards.toFixed(2)}</td>
                <td class="${totalClass}">${totalSign}$${Math.abs(data.totalProfit).toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div>';
    container.innerHTML += html;
}

// Display performance metrics
function displayPerformanceMetrics(summary) {
    const container = document.getElementById('performanceMetrics');
    
    if (!summary) {
        container.innerHTML = '<p class="text-center">No performance data available</p>';
        return;
    }
    
    const totalInvestment = summary.totalInvestment || 0;
    const totalCurrentValue = summary.totalCurrentValue || 0;
    const totalProfit = summary.totalProfit || 0;
    const overallProfitPercentage = summary.overallProfitPercentage || 0;
    const stakingROI = summary.stakingROI || 0;
    
    const profitClass = totalProfit >= 0 ? 'text-success' : 'text-danger';
    const profitSign = totalProfit >= 0 ? '+' : '';
    
    const html = `
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Total Investment</h6>
                        <h3 class="card-title">$${totalInvestment.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Current Value</h6>
                        <h3 class="card-title">$${totalCurrentValue.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Total Profit/Loss</h6>
                        <h3 class="card-title ${profitClass}">${profitSign}$${Math.abs(totalProfit).toFixed(2)}</h3>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Overall ROI</h6>
                        <h3 class="card-title ${profitClass}">${profitSign}${overallProfitPercentage.toFixed(2)}%</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Staking ROI</h6>
                        <h3 class="card-title text-primary">+${stakingROI.toFixed(2)}%</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Open update prices modal
function openUpdatePricesModal() {
    if (!window.tokenList || window.tokenList.length === 0) {
        alert('No tokens found to update prices');
        return;
    }
    
    const container = document.getElementById('priceUpdateForm');
    
    let html = '<div class="table-responsive"><table class="table">';
    html += `
        <thead>
            <tr>
                <th>Token</th>
                <th>Current Price (USD)</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    window.tokenList.forEach(token => {
        html += `
            <tr>
                <td>${token}</td>
                <td>
                    <input type="number" class="form-control token-price" data-token="${token}" step="0.000001" min="0" required>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('updatePricesModal'));
    modal.show();
}

// Update prices
function updatePrices() {
    const priceInputs = document.querySelectorAll('.token-price');
    const prices = [];
    
    let isValid = true;
    
    priceInputs.forEach(input => {
        const token = input.getAttribute('data-token');
        const price = parseFloat(input.value);
        
        if (isNaN(price) || price <= 0) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            prices.push({
                token,
                currentPrice: price
            });
        }
    });
    
    if (!isValid) {
        alert('Please enter valid prices for all tokens');
        return;
    }
    
    fetch('/api/crypto/update-prices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prices })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updatePricesModal'));
            modal.hide();
            
            // Refresh analytics
            fetchCryptoAnalytics();
            
            // Show success message
            alert('Prices updated successfully');
        } else {
            alert('Error updating prices: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating prices:', error);
        alert('Error updating prices. Please try again.');
    });
}
