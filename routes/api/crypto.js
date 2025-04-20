const express = require('express');
const router = express.Router();
const CryptoInvestment = require('../../models/CryptoInvestment');

// Get all crypto investments with portfolio summary
router.get('/', async (req, res) => {
    try {
        const investments = await CryptoInvestment.find().sort({ token: 1 });
        const summary = await CryptoInvestment.getPortfolioSummary();
        
        res.json({
            success: true,
            investments,
            summary
        });
    } catch (err) {
        console.error('Error fetching crypto investments:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching crypto investments',
            error: err.message
        });
    }
});

// Get profit analytics
router.get('/analytics', async (req, res) => {
    try {
        const analytics = await CryptoInvestment.getProfitAnalytics();
        
        res.json({
            success: true,
            analytics
        });
    } catch (err) {
        console.error('Error fetching crypto analytics:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching crypto analytics',
            error: err.message
        });
    }
});

// Get a specific crypto investment
router.get('/:id', async (req, res) => {
    try {
        const investment = await CryptoInvestment.findById(req.params.id);
        
        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Crypto investment not found'
            });
        }
        
        res.json({
            success: true,
            investment
        });
    } catch (err) {
        console.error('Error fetching crypto investment:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching crypto investment',
            error: err.message
        });
    }
});

// Create a new crypto investment
router.post('/', async (req, res) => {
    try {
        const {
            token,
            amount,
            purchasePrice,
            currentPrice,
            purchaseDate,
            stakingEnabled,
            stakingAPR,
            stakingRewards,
            notes
        } = req.body;
        
        const newInvestment = new CryptoInvestment({
            token,
            amount,
            purchasePrice,
            currentPrice,
            purchaseDate,
            stakingEnabled,
            stakingAPR: stakingEnabled ? stakingAPR : 0,
            stakingRewards: stakingEnabled ? stakingRewards : 0,
            notes
        });
        
        await newInvestment.save();
        
        res.status(201).json({
            success: true,
            message: 'Crypto investment created successfully',
            investment: newInvestment
        });
    } catch (err) {
        console.error('Error creating crypto investment:', err);
        res.status(500).json({
            success: false,
            message: 'Error creating crypto investment',
            error: err.message
        });
    }
});

// Update a crypto investment
router.put('/:id', async (req, res) => {
    try {
        const {
            token,
            amount,
            purchasePrice,
            currentPrice,
            purchaseDate,
            stakingEnabled,
            stakingAPR,
            stakingRewards,
            notes
        } = req.body;
        
        const updatedInvestment = await CryptoInvestment.findByIdAndUpdate(
            req.params.id,
            {
                token,
                amount,
                purchasePrice,
                currentPrice,
                purchaseDate,
                stakingEnabled,
                stakingAPR: stakingEnabled ? stakingAPR : 0,
                stakingRewards: stakingEnabled ? stakingRewards : 0,
                notes,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedInvestment) {
            return res.status(404).json({
                success: false,
                message: 'Crypto investment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Crypto investment updated successfully',
            investment: updatedInvestment
        });
    } catch (err) {
        console.error('Error updating crypto investment:', err);
        res.status(500).json({
            success: false,
            message: 'Error updating crypto investment',
            error: err.message
        });
    }
});

// Delete a crypto investment
router.delete('/:id', async (req, res) => {
    try {
        const deletedInvestment = await CryptoInvestment.findByIdAndDelete(req.params.id);
        
        if (!deletedInvestment) {
            return res.status(404).json({
                success: false,
                message: 'Crypto investment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Crypto investment deleted successfully',
            investment: deletedInvestment
        });
    } catch (err) {
        console.error('Error deleting crypto investment:', err);
        res.status(500).json({
            success: false,
            message: 'Error deleting crypto investment',
            error: err.message
        });
    }
});

// Batch update current prices
router.post('/update-prices', async (req, res) => {
    try {
        const { prices } = req.body;
        
        if (!prices || !Array.isArray(prices)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid price data format'
            });
        }
        
        const updatePromises = prices.map(async (priceData) => {
            const { token, currentPrice } = priceData;
            
            if (!token || !currentPrice) {
                return {
                    token,
                    success: false,
                    message: 'Missing token or price'
                };
            }
            
            const result = await CryptoInvestment.updateMany(
                { token },
                { currentPrice, updatedAt: Date.now() }
            );
            
            return {
                token,
                success: true,
                count: result.modifiedCount
            };
        });
        
        const results = await Promise.all(updatePromises);
        
        res.json({
            success: true,
            message: 'Crypto prices updated successfully',
            results
        });
    } catch (err) {
        console.error('Error updating crypto prices:', err);
        res.status(500).json({
            success: false,
            message: 'Error updating crypto prices',
            error: err.message
        });
    }
});

// Import crypto transactions
router.post('/import', async (req, res) => {
    try {
        const { transactions } = req.body;
        
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction data format'
            });
        }
        
        const importPromises = transactions.map(async (transaction) => {
            const newInvestment = new CryptoInvestment(transaction);
            return await newInvestment.save();
        });
        
        const importedInvestments = await Promise.all(importPromises);
        
        res.status(201).json({
            success: true,
            message: `Successfully imported ${importedInvestments.length} crypto investments`,
            investments: importedInvestments
        });
    } catch (err) {
        console.error('Error importing crypto investments:', err);
        res.status(500).json({
            success: false,
            message: 'Error importing crypto investments',
            error: err.message
        });
    }
});

module.exports = router;
