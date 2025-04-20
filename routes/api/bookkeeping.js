const express = require('express');
const router = express.Router();
const Bookkeeping = require('../../models/Bookkeeping');

// Get all bookkeeping entries with financial summary
router.get('/', async (req, res) => {
    try {
        // Apply filters if provided
        const filter = {};
        
        if (req.query.businessCategory) {
            filter.businessCategory = req.query.businessCategory;
        }
        
        if (req.query.transactionType) {
            filter.transactionType = req.query.transactionType;
        }
        
        if (req.query.startDate && req.query.endDate) {
            filter.date = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }
        
        const entries = await Bookkeeping.find(filter).sort({ date: -1 });
        const summary = await Bookkeeping.getFinancialSummary();
        
        res.json({
            success: true,
            entries,
            summary
        });
    } catch (err) {
        console.error('Error fetching bookkeeping entries:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookkeeping entries',
            error: err.message
        });
    }
});

// Get monthly summary
router.get('/monthly-summary/:year?', async (req, res) => {
    try {
        const year = req.params.year ? parseInt(req.params.year) : null;
        const monthlySummary = await Bookkeeping.getMonthlySummary(year);
        
        res.json({
            success: true,
            monthlySummary
        });
    } catch (err) {
        console.error('Error fetching monthly summary:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly summary',
            error: err.message
        });
    }
});

// Get category breakdown
router.get('/category-breakdown', async (req, res) => {
    try {
        const categoryBreakdown = await Bookkeeping.getCategoryBreakdown();
        
        res.json({
            success: true,
            categoryBreakdown
        });
    } catch (err) {
        console.error('Error fetching category breakdown:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching category breakdown',
            error: err.message
        });
    }
});

// Get a specific bookkeeping entry
router.get('/:id', async (req, res) => {
    try {
        const entry = await Bookkeeping.findById(req.params.id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Bookkeeping entry not found'
            });
        }
        
        res.json({
            success: true,
            entry
        });
    } catch (err) {
        console.error('Error fetching bookkeeping entry:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookkeeping entry',
            error: err.message
        });
    }
});

// Create a new bookkeeping entry
router.post('/', async (req, res) => {
    try {
        const {
            date,
            transactionType,
            category,
            businessCategory,
            description,
            amount,
            paymentMethod,
            notes
        } = req.body;
        
        const newEntry = new Bookkeeping({
            date,
            transactionType,
            category,
            businessCategory,
            description,
            amount,
            paymentMethod,
            notes
        });
        
        await newEntry.save();
        
        res.status(201).json({
            success: true,
            message: 'Bookkeeping entry created successfully',
            entry: newEntry
        });
    } catch (err) {
        console.error('Error creating bookkeeping entry:', err);
        res.status(500).json({
            success: false,
            message: 'Error creating bookkeeping entry',
            error: err.message
        });
    }
});

// Update a bookkeeping entry
router.put('/:id', async (req, res) => {
    try {
        const {
            date,
            transactionType,
            category,
            businessCategory,
            description,
            amount,
            paymentMethod,
            notes
        } = req.body;
        
        const updatedEntry = await Bookkeeping.findByIdAndUpdate(
            req.params.id,
            {
                date,
                transactionType,
                category,
                businessCategory,
                description,
                amount,
                paymentMethod,
                notes,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedEntry) {
            return res.status(404).json({
                success: false,
                message: 'Bookkeeping entry not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Bookkeeping entry updated successfully',
            entry: updatedEntry
        });
    } catch (err) {
        console.error('Error updating bookkeeping entry:', err);
        res.status(500).json({
            success: false,
            message: 'Error updating bookkeeping entry',
            error: err.message
        });
    }
});

// Delete a bookkeeping entry
router.delete('/:id', async (req, res) => {
    try {
        const deletedEntry = await Bookkeeping.findByIdAndDelete(req.params.id);
        
        if (!deletedEntry) {
            return res.status(404).json({
                success: false,
                message: 'Bookkeeping entry not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Bookkeeping entry deleted successfully',
            entry: deletedEntry
        });
    } catch (err) {
        console.error('Error deleting bookkeeping entry:', err);
        res.status(500).json({
            success: false,
            message: 'Error deleting bookkeeping entry',
            error: err.message
        });
    }
});

// Import bookkeeping entries
router.post('/import', async (req, res) => {
    try {
        const { entries } = req.body;
        
        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid entry data format'
            });
        }
        
        const importPromises = entries.map(async (entry) => {
            const newEntry = new Bookkeeping(entry);
            return await newEntry.save();
        });
        
        const importedEntries = await Promise.all(importPromises);
        
        res.status(201).json({
            success: true,
            message: `Successfully imported ${importedEntries.length} bookkeeping entries`,
            entries: importedEntries
        });
    } catch (err) {
        console.error('Error importing bookkeeping entries:', err);
        res.status(500).json({
            success: false,
            message: 'Error importing bookkeeping entries',
            error: err.message
        });
    }
});

// Generate financial report
router.get('/report/:year/:month?', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = req.params.month ? parseInt(req.params.month) - 1 : null; // 0-based month
        
        // Create date range filter
        let startDate, endDate;
        
        if (month !== null) {
            // Monthly report
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0); // Last day of month
        } else {
            // Annual report
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
        }
        
        // Get entries for the specified period
        const entries = await Bookkeeping.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });
        
        // Calculate totals
        const totalIncome = entries
            .filter(entry => entry.transactionType === 'Income')
            .reduce((sum, entry) => sum + entry.amount, 0);
        
        const totalExpenses = entries
            .filter(entry => entry.transactionType === 'Expense')
            .reduce((sum, entry) => sum + entry.amount, 0);
        
        const netProfit = totalIncome - totalExpenses;
        
        // Calculate totals by business category
        const businessCategoryTotals = {};
        
        entries.forEach(entry => {
            const category = entry.businessCategory;
            
            if (!businessCategoryTotals[category]) {
                businessCategoryTotals[category] = {
                    income: 0,
                    expenses: 0,
                    net: 0
                };
            }
            
            if (entry.transactionType === 'Income') {
                businessCategoryTotals[category].income += entry.amount;
            } else {
                businessCategoryTotals[category].expenses += entry.amount;
            }
            
            businessCategoryTotals[category].net = 
                businessCategoryTotals[category].income - businessCategoryTotals[category].expenses;
        });
        
        // Calculate totals by category
        const incomeCategories = {};
        const expenseCategories = {};
        
        entries.forEach(entry => {
            const category = entry.category;
            
            if (entry.transactionType === 'Income') {
                if (!incomeCategories[category]) {
                    incomeCategories[category] = 0;
                }
                incomeCategories[category] += entry.amount;
            } else {
                if (!expenseCategories[category]) {
                    expenseCategories[category] = 0;
                }
                expenseCategories[category] += entry.amount;
            }
        });
        
        res.json({
            success: true,
            report: {
                period: {
                    year,
                    month: month !== null ? month + 1 : null, // 1-based month for response
                    startDate,
                    endDate
                },
                summary: {
                    totalIncome,
                    totalExpenses,
                    netProfit
                },
                businessCategoryTotals,
                categoryBreakdown: {
                    incomeCategories,
                    expenseCategories
                },
                entries
            }
        });
    } catch (err) {
        console.error('Error generating financial report:', err);
        res.status(500).json({
            success: false,
            message: 'Error generating financial report',
            error: err.message
        });
    }
});

module.exports = router;
