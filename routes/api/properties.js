const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find();
    
    // Calculate portfolio totals
    const totalMonthlyRent = properties.reduce((sum, property) => sum + property.monthlyRent, 0);
    const totalMonthlyExpenses = properties.reduce((sum, property) => sum + property.monthlyExpenses, 0);
    const totalMonthlyNet = properties.reduce((sum, property) => sum + property.monthlyNet, 0);
    const totalAnnualNet = properties.reduce((sum, property) => sum + property.annualNet, 0);
    const totalMortgageBalance = properties.reduce((sum, property) => sum + (property.mortgageBalance || 0), 0);
    
    // Find properties with leases expiring in the next 90 days
    const today = new Date();
    const ninetyDaysFromNow = new Date(today);
    ninetyDaysFromNow.setDate(today.getDate() + 90);
    
    const expiringLeases = properties.filter(property => {
      if (!property.leaseExpiration) return false;
      const leaseDate = new Date(property.leaseExpiration);
      return leaseDate <= ninetyDaysFromNow;
    });
    
    res.json({
      properties,
      totalMonthlyRent,
      totalMonthlyExpenses,
      totalMonthlyNet,
      totalAnnualNet,
      totalMortgageBalance,
      expiringLeases
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new property
router.post('/', async (req, res) => {
  try {
    const newProperty = new Property({
      address: req.body.address,
      unit: req.body.unit,
      tenant: req.body.tenant,
      monthlyRent: req.body.monthlyRent,
      leaseExpiration: req.body.leaseExpiration,
      dueDate: req.body.dueDate,
      lateFee: req.body.lateFee,
      contactInfo: req.body.contactInfo,
      paysUtilities: req.body.paysUtilities !== undefined ? req.body.paysUtilities : true,
      mortgagePayment: req.body.mortgagePayment,
      hoaFee: req.body.hoaFee,
      propertyTax: req.body.propertyTax,
      mortgageBalance: req.body.mortgageBalance,
      notes: req.body.notes
    });

    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update property
router.put('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Update fields
    property.address = req.body.address || property.address;
    property.unit = req.body.unit !== undefined ? req.body.unit : property.unit;
    property.tenant = req.body.tenant !== undefined ? req.body.tenant : property.tenant;
    property.monthlyRent = req.body.monthlyRent !== undefined ? req.body.monthlyRent : property.monthlyRent;
    property.leaseExpiration = req.body.leaseExpiration || property.leaseExpiration;
    property.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : property.dueDate;
    property.lateFee = req.body.lateFee !== undefined ? req.body.lateFee : property.lateFee;
    property.contactInfo = req.body.contactInfo !== undefined ? req.body.contactInfo : property.contactInfo;
    property.paysUtilities = req.body.paysUtilities !== undefined ? req.body.paysUtilities : property.paysUtilities;
    property.mortgagePayment = req.body.mortgagePayment !== undefined ? req.body.mortgagePayment : property.mortgagePayment;
    property.hoaFee = req.body.hoaFee !== undefined ? req.body.hoaFee : property.hoaFee;
    property.propertyTax = req.body.propertyTax !== undefined ? req.body.propertyTax : property.propertyTax;
    property.mortgageBalance = req.body.mortgageBalance !== undefined ? req.body.mortgageBalance : property.mortgageBalance;
    property.notes = req.body.notes !== undefined ? req.body.notes : property.notes;

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete property
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.remove();
    res.json({ message: 'Property removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Import properties from JSON
router.post('/import', async (req, res) => {
  try {
    const properties = req.body.properties;
    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({ message: 'Invalid property data' });
    }

    const importedProperties = [];
    for (const prop of properties) {
      const newProperty = new Property({
        address: prop.address,
        unit: prop.unit,
        tenant: prop.tenant,
        monthlyRent: prop.monthlyRent || prop.rent,
        leaseExpiration: prop.leaseExpiration,
        dueDate: prop.dueDate || prop.due_date,
        lateFee: prop.lateFee,
        contactInfo: prop.contactInfo || prop.contact_info,
        paysUtilities: prop.paysUtilities !== undefined ? prop.paysUtilities : true,
        mortgagePayment: prop.mortgagePayment,
        hoaFee: prop.hoaFee,
        propertyTax: prop.propertyTax,
        mortgageBalance: prop.mortgageBalance,
        notes: prop.notes
      });

      const savedProperty = await newProperty.save();
      importedProperties.push(savedProperty);
    }

    res.json({ message: `${importedProperties.length} properties imported`, properties: importedProperties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
