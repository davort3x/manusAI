// Enhanced crypto investments functionality with profit analytics

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for crypto investments
const CryptoInvestmentSchema = new Schema({
    token: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0
    },
    currentPrice: {
        type: Number,
        required: true,
        min: 0
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    stakingEnabled: {
        type: Boolean,
        default: false
    },
    stakingAPR: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stakingRewards: {
        type: Number,
        default: 0,
        min: 0
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
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual properties for calculated fields
CryptoInvestmentSchema.virtual('currentValue').get(function() {
    return this.amount * this.currentPrice;
});

CryptoInvestmentSchema.virtual('purchaseValue').get(function() {
    return this.amount * this.purchasePrice;
});

CryptoInvestmentSchema.virtual('profitLoss').get(function() {
    return (this.currentValue - this.purchaseValue);
});

CryptoInvestmentSchema.virtual('profitLossPercentage').get(function() {
    if (this.purchaseValue === 0) return 0;
    return (this.profitLoss / this.purchaseValue) * 100;
});

CryptoInvestmentSchema.virtual('totalReturn').get(function() {
    return this.profitLoss + this.stakingRewards;
});

CryptoInvestmentSchema.virtual('totalReturnPercentage').get(function() {
    if (this.purchaseValue === 0) return 0;
    return (this.totalReturn / this.purchaseValue) * 100;
});

// Pre-save middleware to update the updatedAt field
CryptoInvestmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to calculate portfolio summary
CryptoInvestmentSchema.statics.getPortfolioSummary = async function() {
    const investments = await this.find();
    
    if (investments.length === 0) {
        return {
            totalInvestment: 0,
            totalCurrentValue: 0,
            totalProfit: 0,
            overallProfitPercentage: 0,
            totalStakingRewards: 0,
            stakingROI: 0
        };
    }
    
    const totalInvestment = investments.reduce((sum, investment) => sum + investment.purchaseValue, 0);
    const totalCurrentValue = investments.reduce((sum, investment) => sum + investment.currentValue, 0);
    const totalProfitLoss = investments.reduce((sum, investment) => sum + investment.profitLoss, 0);
    const totalStakingRewards = investments.reduce((sum, investment) => sum + investment.stakingRewards, 0);
    const totalProfit = totalProfitLoss + totalStakingRewards;
    
    return {
        totalInvestment,
        totalCurrentValue,
        totalProfitLoss,
        totalStakingRewards,
        totalProfit,
        overallProfitPercentage: totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0,
        stakingROI: totalInvestment > 0 ? (totalStakingRewards / totalInvestment) * 100 : 0
    };
};

// Static method to get profit analytics
CryptoInvestmentSchema.statics.getProfitAnalytics = async function() {
    const investments = await this.find();
    const summary = await this.getPortfolioSummary();
    
    // Calculate profit contribution by token
    const tokenProfitContribution = {};
    investments.forEach(investment => {
        const token = investment.token;
        if (!tokenProfitContribution[token]) {
            tokenProfitContribution[token] = {
                marketGains: 0,
                stakingRewards: 0,
                totalProfit: 0
            };
        }
        
        tokenProfitContribution[token].marketGains += investment.profitLoss;
        tokenProfitContribution[token].stakingRewards += investment.stakingRewards;
        tokenProfitContribution[token].totalProfit += investment.totalReturn;
    });
    
    // Calculate profit by investment duration
    const profitByDuration = {};
    investments.forEach(investment => {
        const durationDays = Math.floor((new Date() - investment.purchaseDate) / (1000 * 60 * 60 * 24));
        const durationCategory = 
            durationDays < 30 ? 'lessThan30Days' :
            durationDays < 90 ? '30To90Days' :
            durationDays < 180 ? '90To180Days' :
            durationDays < 365 ? '180To365Days' : 'moreThan365Days';
        
        if (!profitByDuration[durationCategory]) {
            profitByDuration[durationCategory] = {
                totalInvestment: 0,
                totalProfit: 0,
                count: 0
            };
        }
        
        profitByDuration[durationCategory].totalInvestment += investment.purchaseValue;
        profitByDuration[durationCategory].totalProfit += investment.totalReturn;
        profitByDuration[durationCategory].count += 1;
    });
    
    // Calculate ROI for each duration category
    Object.keys(profitByDuration).forEach(category => {
        const data = profitByDuration[category];
        data.roi = data.totalInvestment > 0 ? (data.totalProfit / data.totalInvestment) * 100 : 0;
    });
    
    // Calculate staking efficiency (rewards per token)
    const stakingEfficiency = {};
    investments.filter(inv => inv.stakingEnabled).forEach(investment => {
        const token = investment.token;
        if (!stakingEfficiency[token]) {
            stakingEfficiency[token] = {
                totalStaked: 0,
                totalRewards: 0,
                effectiveAPR: 0
            };
        }
        
        stakingEfficiency[token].totalStaked += investment.purchaseValue;
        stakingEfficiency[token].totalRewards += investment.stakingRewards;
    });
    
    // Calculate effective APR for each token
    Object.keys(stakingEfficiency).forEach(token => {
        const data = stakingEfficiency[token];
        data.effectiveAPR = data.totalStaked > 0 ? (data.totalRewards / data.totalStaked) * 100 : 0;
    });
    
    return {
        summary,
        tokenProfitContribution,
        profitByDuration,
        stakingEfficiency
    };
};

// Create and export the model
const CryptoInvestment = mongoose.model('CryptoInvestment', CryptoInvestmentSchema);
module.exports = CryptoInvestment;
