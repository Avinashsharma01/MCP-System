const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [{
        type: {
            type: String,
            enum: ['CREDIT', 'DEBIT'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        reference: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            default: 'PENDING'
        },
        metadata: {
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            },
            transferredTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            transferredFrom: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            paymentMethod: String,
            upiId: String,
            bankDetails: {
                accountNumber: String,
                ifscCode: String,
                accountHolderName: String
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Index for quick lookups
walletSchema.index({ userId: 1 });
walletSchema.index({ 'transactions.status': 1 });
walletSchema.index({ 'transactions.createdAt': -1 });

// Method to add transaction
walletSchema.methods.addTransaction = async function(transactionData) {
    this.transactions.push(transactionData);
    this.lastUpdated = Date.now();
    
    if (transactionData.status === 'COMPLETED') {
        if (transactionData.type === 'CREDIT') {
            this.balance += transactionData.amount;
        } else if (transactionData.type === 'DEBIT') {
            if (this.balance < transactionData.amount) {
                throw new Error('Insufficient balance');
            }
            this.balance -= transactionData.amount;
        }
    }
    
    return this.save();
};

// Method to update transaction status
walletSchema.methods.updateTransactionStatus = async function(transactionId, newStatus) {
    const transaction = this.transactions.id(transactionId);
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    
    const oldStatus = transaction.status;
    transaction.status = newStatus;
    
    // If status is changing to COMPLETED, update balance
    if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
        if (transaction.type === 'CREDIT') {
            this.balance += transaction.amount;
        } else if (transaction.type === 'DEBIT') {
            if (this.balance < transaction.amount) {
                throw new Error('Insufficient balance');
            }
            this.balance -= transaction.amount;
        }
    }
    
    this.lastUpdated = Date.now();
    return this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet; 