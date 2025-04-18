// Real Estate JavaScript for fetching and displaying properties

document.addEventListener('DOMContentLoaded', function() {
    // Fetch all properties
    fetchProperties();
    
    // Set up event listeners
    document.getElementById('savePropertyBtn').addEventListener('click', saveProperty);
    document.getElementById('updatePropertyBtn').addEventListener('click', updateProperty);
    document.getElementById('deletePropertyBtn').addEventListener('click', deleteProperty);
    document.getElementById('importPropertiesBtn').addEventListener('click', importProperties);
});

// Global variable to store all properties
let allProperties = [];

// Fetch all properties
function fetchProperties() {
    fetch('/api/properties')
        .then(response => response.json())
        .then(data => {
            allProperties = data.properties || [];
            displaySummary(data.summary);
            displayLeaseExpirations(data.properties);
            displayProperties(data.properties);
        })
        .catch(error => {
            console.error('Error fetching properties:', error);
            document.getElementById('monthlyIncome').innerHTML = '<p class="text-danger">Error loading property data</p>';
        });
}

// Display summary
function displaySummary(summary) {
    if (!summary) {
        document.getElementById('monthlyIncome').innerHTML = '<h3>$0.00</h3>';
        document.getElementById('monthlyExpenses').innerHTML = '<h3>$0.00</h3>';
        document.getElementById('monthlyNet').innerHTML = '<h3>$0.00</h3>';
        document.getElementById('annualNet').innerHTML = '<h3>$0.00</h3>';
        return;
    }
    
    const monthlyIncome = summary.monthlyIncome || 0;
    const monthlyExpenses = summary.monthlyExpenses || 0;
    const monthlyNet = summary.monthlyNet || 0;
    const annualNet = summary.annualNet || 0;
    
    document.getElementById('monthlyIncome').innerHTML = `<h3>$${monthlyIncome.toFixed(2)}</h3>`;
    document.getElementById('monthlyExpenses').innerHTML = `<h3>$${monthlyExpenses.toFixed(2)}</h3>`;
    
    const monthlyNetClass = monthlyNet >= 0 ? 'text-success' : 'text-danger';
    document.getElementById('monthlyNet').innerHTML = `<h3 class="${monthlyNetClass}">$${monthlyNet.toFixed(2)}</h3>`;
    
    const annualNetClass = annualNet >= 0 ? 'text-success' : 'text-danger';
    document.getElementById('annualNet').innerHTML = `<h3 class="${annualNetClass}">$${annualNet.toFixed(2)}</h3>`;
}

// Display lease expirations
function displayLeaseExpirations(properties) {
    const container = document.getElementById('leaseExpirations');
    
    if (!properties || properties.length === 0) {
        container.innerHTML = '<p class="text-center">No properties found</p>';
        return;
    }
    
    // Filter properties with lease expiration dates
    const propertiesWithLeases = properties.filter(property => property.leaseExpiration);
    
    if (propertiesWithLeases.length === 0) {
        container.innerHTML = '<p class="text-center">No lease expiration dates found</p>';
        return;
    }
    
    // Sort by lease expiration date (soonest first)
    const sortedProperties = [...propertiesWithLeases].sort((a, b) => {
        return new Date(a.leaseExpiration) - new Date(b.leaseExpiration);
    });
    
    // Get current date
    const currentDate = new Date();
    
    // Filter for leases expiring in the next 90 days
    const upcomingExpirations = sortedProperties.filter(property => {
        const expirationDate = new Date(property.leaseExpiration);
        const daysDifference = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));
        return daysDifference >= 0 && daysDifference <= 90;
    });
    
    if (upcomingExpirations.length === 0) {
        container.innerHTML = '<p class="text-center">No upcoming lease expirations in the next 90 days</p>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += `
        <thead>
            <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Expiration Date</th>
                <th>Days Remaining</th>
                <th>Monthly Rent</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    upcomingExpirations.forEach(property => {
        const expirationDate = new Date(property.leaseExpiration);
        const formattedDate = expirationDate.toLocaleDateString();
        
        const daysDifference = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));
        
        let rowClass = '';
        if (daysDifference <= 30) {
            rowClass = 'table-danger';
        } else if (daysDifference <= 60) {
            rowClass = 'table-warning';
        }
        
        const propertyAddress = property.unit ? `${property.address}, Unit ${property.unit}` : property.address;
        
        html += `
            <tr class="${rowClass}" data-id="${property._id}">
                <td>${propertyAddress}</td>
                <td>${property.tenant || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>${daysDifference} days</td>
                <td>$${property.monthlyRent.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Add event listeners to table rows
    document.querySelectorAll('#leaseExpirations tbody tr').forEach(row => {
        row.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            openEditPropertyModal(propertyId);
        });
    });
}

// Display properties
function displayProperties(properties) {
    const container = document.getElementById('propertiesList');
    
    if (!properties || properties.length === 0) {
        container.innerHTML = '<p class="text-center">No properties found</p>';
        return;
    }
    
    // Sort properties by address
    const sortedProperties = [...properties].sort((a, b) => {
        return a.address.localeCompare(b.address);
    });
    
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += `
        <thead>
            <tr>
                <th>Address</th>
                <th>Tenant</th>
                <th>Monthly Rent</th>
                <th>Due Date</th>
                <th>Lease Expiration</th>
                <th>Monthly Expenses</th>
                <th>Monthly Net</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    sortedProperties.forEach(property => {
        const propertyAddress = property.unit ? `${property.address}, Unit ${property.unit}` : property.address;
        
        const dueDate = property.dueDate ? `${property.dueDate}th` : 'N/A';
        
        const leaseExpiration = property.leaseExpiration ? new Date(property.leaseExpiration).toLocaleDateString() : 'N/A';
        
        // Calculate monthly expenses
        const mortgagePayment = property.mortgagePayment || 0;
        const hoaFee = property.hoaFee || 0;
        const propertyTax = property.propertyTax ? property.propertyTax / 12 : 0; // Convert annual to monthly
        const monthlyExpenses = mortgagePayment + hoaFee + propertyTax;
        
        // Calculate monthly net
        const monthlyRent = property.monthlyRent || 0;
        const monthlyNet = monthlyRent - monthlyExpenses;
        
        const netClass = monthlyNet >= 0 ? 'text-success' : 'text-danger';
        
        html += `
            <tr data-id="${property._id}">
                <td>${propertyAddress}</td>
                <td>${property.tenant || 'Vacant'}</td>
                <td>$${monthlyRent.toFixed(2)}</td>
                <td>${dueDate}</td>
                <td>${leaseExpiration}</td>
                <td>$${monthlyExpenses.toFixed(2)}</td>
                <td class="${netClass}">$${monthlyNet.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-property-btn" data-id="${property._id}">Edit</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-property-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const propertyId = this.getAttribute('data-id');
            openEditPropertyModal(propertyId);
        });
    });
    
    // Add event listeners to table rows
    document.querySelectorAll('#propertiesList tbody tr').forEach(row => {
        row.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            openEditPropertyModal(propertyId);
        });
    });
}

// Save new property
function saveProperty() {
    const address = document.getElementById('propertyAddress').value;
    const unit = document.getElementById('propertyUnit').value;
    const tenant = document.getElementById('propertyTenant').value;
    const contactInfo = document.getElementById('propertyContactInfo').value;
    const monthlyRent = parseFloat(document.getElementById('propertyMonthlyRent').value);
    const dueDate = document.getElementById('propertyDueDate').value ? parseInt(document.getElementById('propertyDueDate').value) : null;
    const lateFee = document.getElementById('propertyLateFee').value ? parseFloat(document.getElementById('propertyLateFee').value) : null;
    const leaseExpiration = document.getElementById('propertyLeaseExpiration').value;
    const paysUtilities = document.getElementById('propertyPaysUtilities').checked;
    const mortgagePayment = document.getElementById('propertyMortgagePayment').value ? parseFloat(document.getElementById('propertyMortgagePayment').value) : null;
    const hoaFee = document.getElementById('propertyHoaFee').value ? parseFloat(document.getElementById('propertyHoaFee').value) : null;
    const propertyTax = document.getElementById('propertyPropertyTax').value ? parseFloat(document.getElementById('propertyPropertyTax').value) : null;
    const mortgageBalance = document.getElementById('propertyMortgageBalance').value ? parseFloat(document.getElementById('propertyMortgageBalance').value) : null;
    const notes = document.getElementById('propertyNotes').value;
    
    if (!address || isNaN(monthlyRent)) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newProperty = {
        address,
        unit,
        tenant,
        contactInfo,
        monthlyRent,
        dueDate,
        lateFee,
        leaseExpiration,
        paysUtilities,
        mortgagePayment,
        hoaFee,
        propertyTax,
        mortgageBalance,
        notes
    };
    
    fetch('/api/properties', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProperty)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addPropertyForm').reset();
        
        // Refresh properties
        fetchProperties();
    })
    .catch(error => {
        console.error('Error adding property:', error);
        alert('Error adding property. Please try again.');
    });
}

// Open edit property modal
function openEditPropertyModal(propertyId) {
    const property = allProperties.find(p => p._id === propertyId);
    
    if (!property) {
        console.error('Property not found');
        return;
    }
    
    // Populate form fields
    document.getElementById('editPropertyId').value = property._id;
    document.getElementById('editPropertyAddress').value = property.address;
    document.getElementById('editPropertyUnit').value = property.unit || '';
    document.getElementById('editPropertyTenant').value = property.tenant || '';
    document.getElementById('editPropertyContactInfo').value = property.contactInfo || '';
    document.getElementById('editPropertyMonthlyRent').value = property.monthlyRent;
    document.getElementById('editPropertyDueDate').value = property.dueDate || '';
    document.getElementById('editPropertyLateFee').value = property.lateFee || '';
    document.getElementById('editPropertyPaysUtilities').checked = property.paysUtilities !== false; // Default to true if undefined
    document.getElementById('editPropertyMortgagePayment').value = property.mortgagePayment || '';
    document.getElementById('editPropertyHoaFee').value = property.hoaFee || '';
    document.getElementById('editPropertyPropertyTax').value = property.propertyTax || '';
    document.getElementById('editPropertyMortgageBalance').value = property.mortgageBalance || '';
    document.getElementById('editPropertyNotes').value = property.notes || '';
    
    // Format date for input field (YYYY-MM-DD)
    if (property.leaseExpiration) {
        const date = new Date(property.leaseExpiration);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('editPropertyLeaseExpiration').value = formattedDate;
    } else {
        document.getElementById('editPropertyLeaseExpiration').value = '';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editPropertyModal'));
    modal.show();
}

// Update property
function updateProperty() {
    const propertyId = document.getElementById('editPropertyId').value;
    const address = document.getElementById('editPropertyAddress').value;
    const unit = document.getElementById('editPropertyUnit').value;
    const tenant = document.getElementById('editPropertyTenant').value;
    const contactInfo = document.getElementById('editPropertyContactInfo').value;
    const monthlyRent = parseFloat(document.getElementById('editPropertyMonthlyRent').value);
    const dueDate = document.getElementById('editPropertyDueDate').value ? parseInt(document.getElementById('editPropertyDueDate').value) : null;
    const lateFee = document.getElementById('editPropertyLateFee').value ? parseFloat(document.getElementById('editPropertyLateFee').value) : null;
    const leaseExpiration = document.getElementById('editPropertyLeaseExpiration').value;
    const paysUtilities = document.getElementById('editPropertyPaysUtilities').checked;
    const mortgagePayment = document.getElementById('editPropertyMortgagePayment').value ? parseFloat(document.getElementById('editPropertyMortgagePayment').value) : null;
    const hoaFee = document.getElementById('editPropertyHoaFee').value ? parseFloat(document.getElementById('editPropertyHoaFee').value) : null;
    const propertyTax = document.getElementById('editPropertyPropertyTax').value ? parseFloat(document.getElementById('editPropertyPropertyTax').value) : null;
    const mortgageBalance = document.getElementById('editPropertyMortgageBalance').value ? parseFloat(document.getElementById('editPropertyMortgageBalance').value) : null;
    const notes = document.getElementById('editPropertyNotes').value;
    
    if (!address || isNaN(monthlyRent)) {
        alert('Please fill in all required fields');
        return;
    }
    
    const updatedProperty = {
        address,
        unit,
        tenant,
        contactInfo,
        monthlyRent,
        dueDate,
        lateFee,
        leaseExpiration,
        paysUtilities,
        mortgagePayment,
        hoaFee,
        propertyTax,
        mortgageBalance,
        notes
    };
    
    fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProperty)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editPropertyModal'));
        modal.hide();
        
        // Refresh properties
        fetchProperties();
    })
    .catch(error => {
        console.error('Error updating property:', error);
        alert('Error updating property. Please try again.');
    });
}

// Delete property
function deleteProperty() {
    const propertyId = document.getElementById('editPropertyId').value;
    
    if (confirm('Are you sure you want to delete this property?')) {
        fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editPropertyModal'));
            modal.hide();
            
            // Refresh properties
            fetchProperties();
        })
        .catch(error => {
            console.error('Error deleting property:', error);
            alert('Error deleting property. Please try again.');
        });
    }
}

// Import properties
function importProperties() {
    const year = document.getElementById('importYear').value;
    
    fetch(`/api/properties/import/${year}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('importPropertiesModal'));
        modal.hide();
        
        // Show success message
        alert(`Successfully imported ${data.properties.length} properties from ${year}`);
        
        // Refresh properties
        fetchProperties();
    })
    .catch(error => {
        console.error('Error importing properties:', error);
        alert('Error importing properties. Please try again.');
    });
}
