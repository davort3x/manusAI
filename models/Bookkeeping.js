// Enhanced bookkeeping functionality for tracking business transactions

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for bookkeeping entries
const BookkeepingSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    transactionType: {
        type: String,
        required: true,
        enum: ['Income', 'Expense']
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    businessCategory: {
        type: String,
        required: true,
        enum: ['Mealworms/BSFL', 'Flags', 'Rentals', 'Crypto', 'Other']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update the updatedAt field
BookkeepingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to calculate financial summary
BookkeepingSchema.statics.getFinancialSummary = async function() {
    const entries = await this.find();
    
    if (entries.length === 0) {
        return {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            businessCategoryTotals: {}
        };
    }
    
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
    
    return {
        totalIncome,
        totalExpenses,
        netProfit,
        businessCategoryTotals
    };
};

// Static method to get monthly summary
BookkeepingSchema.statics.getMonthlySummary = async function(year) {
    const currentYear = year || new Date().getFullYear();
    
    // Get all entries for the specified year
    const entries = await this.find({
        date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
        }
    });
    
    // Initialize monthly summary
    const monthlySummary = Array(12).fill().map(() => ({
        income: 0,
        expenses: 0,
        net: 0
    }));
    
    // Calculate monthly totals
    entries.forEach(entry => {
        const month = new Date(entry.date).getMonth();
        
        if (entry.transactionType === 'Income') {
            monthlySummary[month].income += entry.amount;
        } else {
            monthlySummary[month].expenses += entry.amount;
        }
        
        monthlySummary[month].net = monthlySummary[month].income - monthlySummary[month].expenses;
    });
    
    return {
        year: currentYear,
        monthlySummary
    };
};

// Static method to get category breakdown
BookkeepingSchema.statics.getCategoryBreakdown = async function() {
    const entries = await this.find();
    
    if (entries.length === 0) {
        return {
            incomeCategories: {},
            expenseCategories: {}
        };
    }
    
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
    
    return {
        incomeCategories,
        expenseCategories
    };
};

// Create and export the model
const Bookkeeping = mongoose.model('Bookkeeping', BookkeepingSchema);
module.exports = Bookkeeping;
