const express = require('express');
const router = express.Router();
const FinancialAnalysis = require('../models/FinancialAnalysis');

// Get all financial analyses
router.get('/', async (req, res) => {
  try {
    const analyses = await FinancialAnalysis.find();
    res.json(analyses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get financial analysis by SKU
router.get('/:sku', async (req, res) => {
  try {
    const analysis = await FinancialAnalysis.findOne({ sku: req.params.sku });
    if (!analysis) {
      return res.status(404).json({ message: 'Financial analysis not found' });
    }
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new financial analysis
router.post('/', async (req, res) => {
  try {
    const newAnalysis = new FinancialAnalysis({
      sku: req.body.sku,
      costBreakdown: {
        productCost: req.body.costBreakdown.productCost || 0,
        shipping: req.body.costBreakdown.shipping || 0,
        tariffs: req.body.costBreakdown.tariffs || 0,
        amazonFees: req.body.costBreakdown.amazonFees || 0,
        otherFees: req.body.costBreakdown.otherFees || 0
      },
      pricing: {
        amazon: req.body.pricing.amazon || 0,
        website: req.body.pricing.website || 0
      },
      tariffScenarios: req.body.tariffScenarios || []
    });

    const analysis = await newAnalysis.save();
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update financial analysis
router.put('/:sku', async (req, res) => {
  try {
    const analysis = await FinancialAnalysis.findOne({ sku: req.params.sku });
    if (!analysis) {
      return res.status(404).json({ message: 'Financial analysis not found' });
    }

    // Update fields
    if (req.body.costBreakdown) {
      analysis.costBreakdown.productCost = req.body.costBreakdown.productCost !== undefined ? req.body.costBreakdown.productCost : analysis.costBreakdown.productCost;
      analysis.costBreakdown.shipping = req.body.costBreakdown.shipping !== undefined ? req.body.costBreakdown.shipping : analysis.costBreakdown.shipping;
      analysis.costBreakdown.tariffs = req.body.costBreakdown.tariffs !== undefined ? req.body.costBreakdown.tariffs : analysis.costBreakdown.tariffs;
      analysis.costBreakdown.amazonFees = req.body.costBreakdown.amazonFees !== undefined ? req.body.costBreakdown.amazonFees : analysis.costBreakdown.amazonFees;
      analysis.costBreakdown.otherFees = req.body.costBreakdown.otherFees !== undefined ? req.body.costBreakdown.otherFees : analysis.costBreakdown.otherFees;
    }
    
    if (req.body.pricing) {
      analysis.pricing.amazon = req.body.pricing.amazon !== undefined ? req.body.pricing.amazon : analysis.pricing.amazon;
      analysis.pricing.website = req.body.pricing.website !== undefined ? req.body.pricing.website : analysis.pricing.website;
    }
    
    if (req.body.tariffScenarios) {
      analysis.tariffScenarios = req.body.tariffScenarios;
    }

    const updatedAnalysis = await analysis.save();
    res.json(updatedAnalysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete financial analysis
router.delete('/:sku', async (req, res) => {
  try {
    const analysis = await FinancialAnalysis.findOne({ sku: req.params.sku });
    if (!analysis) {
      return res.status(404).json({ message: 'Financial analysis not found' });
    }

    await analysis.remove();
    res.json({ message: 'Financial analysis removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Calculate tariff impact scenarios
router.post('/tariff-scenarios/:sku', async (req, res) => {
  try {
    const analysis = await FinancialAnalysis.findOne({ sku: req.params.sku });
    if (!analysis) {
      return res.status(404).json({ message: 'Financial analysis not found' });
    }

    const scenarios = req.body.scenarios || [];
    const results = [];

    // Calculate impact for each scenario
    for (const scenario of scenarios) {
      const rate = scenario.rate;
      const originalTariff = analysis.costBreakdown.tariffs;
      const newTariff = (analysis.costBreakdown.productCost * (rate / 100));
      const tariffDifference = newTariff - originalTariff;
      
      const landedCost = analysis.costBreakdown.productCost +
                         analysis.costBreakdown.shipping +
                         newTariff +
                         analysis.costBreakdown.amazonFees +
                         analysis.costBreakdown.otherFees;
      
      let newMargin = 0;
      if (analysis.pricing.amazon > 0) {
        newMargin = ((analysis.pricing.amazon - landedCost) / analysis.pricing.amazon) * 100;
      }
      
      results.push({
        rate,
        impact: tariffDifference,
        newMargin
      });
    }

    // Save scenarios to the analysis
    analysis.tariffScenarios = results;
    await analysis.save();

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
