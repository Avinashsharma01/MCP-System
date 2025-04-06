const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

// MCP credits/debits wallet of Pickup Partner
exports.modifyWallet = async (req, res) => {
  const { userId, amount, type, reason } = req.body;

  try {
    const partner = await User.findById(userId);
    if (!partner || partner.role !== 'PickupPartner') {
      return res.status(404).json({ message: 'Pickup Partner not found' });
    }

    let newBalance = partner.walletBalance;

    if (type === 'credit') {
      newBalance += amount;
    } else if (type === 'debit') {
      if (partner.walletBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      newBalance -= amount;
    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update wallet
    partner.walletBalance = newBalance;
    await partner.save();

    // Save transaction
    const transaction = new Transaction({
      userId,
      amount,
      type,
      reason,
      balanceAfter: newBalance,
    });

    await transaction.save();

    res.status(200).json({ message: 'Transaction successful', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Transaction failed', error: err.message });
  }
};

// Get all transactions (admin side)
exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
};

// Get transaction history of a pickup partner
exports.getPartnerTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    const transactions = await Transaction.find({ userId: id }).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user transactions', error: err.message });
  }
};

// Get wallet balance and recent transactions
exports.getWalletDetails = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.userId });
        
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Get recent transactions (last 10)
        const recentTransactions = wallet.transactions
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10);

        res.json({
            success: true,
            data: {
                balance: wallet.balance,
                recentTransactions
            }
        });
    } catch (error) {
        console.error('Get wallet details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet details',
            error: error.message
        });
    }
};

// Add funds to wallet (for MCP)
exports.addFunds = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, paymentMethod, paymentDetails } = req.body;

        // Validate user is MCP
        const user = await User.findById(req.user.userId);
        if (user.role !== 'MCP') {
            throw new Error('Only MCPs can add funds directly');
        }

        const wallet = await Wallet.findOne({ userId: req.user.userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        // Create transaction record
        const transactionData = {
            type: 'CREDIT',
            amount,
            description: 'Funds added to wallet',
            reference: `ADD-${Date.now()}`,
            status: 'COMPLETED',
            metadata: {
                paymentMethod,
                ...paymentDetails
            }
        };

        await wallet.addTransaction(transactionData);

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Funds added successfully',
            data: {
                balance: wallet.balance,
                transaction: wallet.transactions[wallet.transactions.length - 1]
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Add funds error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding funds',
            error: error.message
        });
    }
};

// Transfer funds to pickup partner
exports.transferFunds = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { partnerId, amount, description } = req.body;

        // Validate user is MCP
        const mcp = await User.findById(req.user.userId);
        if (mcp.role !== 'MCP') {
            throw new Error('Only MCPs can transfer funds');
        }

        // Validate pickup partner
        const partner = await User.findById(partnerId);
        if (!partner || partner.role !== 'PICKUP_PARTNER' || partner.mcpId.toString() !== mcp._id.toString()) {
            throw new Error('Invalid pickup partner');
        }

        // Get both wallets
        const mcpWallet = await Wallet.findOne({ userId: mcp._id });
        const partnerWallet = await Wallet.findOne({ userId: partnerId });

        if (!mcpWallet || !partnerWallet) {
            throw new Error('Wallet not found');
        }

        if (mcpWallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Create transaction records
        const reference = `TRF-${Date.now()}`;

        // Debit MCP wallet
        await mcpWallet.addTransaction({
            type: 'DEBIT',
            amount,
            description: `Transfer to ${partner.name}`,
            reference,
            status: 'COMPLETED',
            metadata: {
                transferredTo: partnerId
            }
        });

        // Credit partner wallet
        await partnerWallet.addTransaction({
            type: 'CREDIT',
            amount,
            description: description || `Received from ${mcp.name}`,
            reference,
            status: 'COMPLETED',
            metadata: {
                transferredFrom: mcp._id
            }
        });

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Funds transferred successfully',
            data: {
                mcpBalance: mcpWallet.balance,
                partnerBalance: partnerWallet.balance,
                transaction: mcpWallet.transactions[mcpWallet.transactions.length - 1]
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Transfer funds error:', error);
        res.status(500).json({
            success: false,
            message: 'Error transferring funds',
            error: error.message
        });
    }
};

// Get transaction history with filters
exports.getTransactionHistory = async (req, res) => {
    try {
        const { startDate, endDate, type, status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const wallet = await Wallet.findOne({ userId: req.user.userId });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Apply filters
        let transactions = wallet.transactions;

        if (startDate && endDate) {
            transactions = transactions.filter(t => 
                t.createdAt >= new Date(startDate) && 
                t.createdAt <= new Date(endDate)
            );
        }

        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }

        if (status) {
            transactions = transactions.filter(t => t.status === status);
        }

        // Sort by date descending
        transactions.sort((a, b) => b.createdAt - a.createdAt);

        // Paginate results
        const totalTransactions = transactions.length;
        transactions = transactions.slice(skip, skip + limit);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total: totalTransactions,
                    page: parseInt(page),
                    totalPages: Math.ceil(totalTransactions / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history',
            error: error.message
        });
    }
};

// Withdraw funds (for pickup partners)
exports.withdrawFunds = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, bankDetails } = req.body;

        const wallet = await Wallet.findOne({ userId: req.user.userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Create withdrawal transaction
        const transactionData = {
            type: 'DEBIT',
            amount,
            description: 'Withdrawal request',
            reference: `WTH-${Date.now()}`,
            status: 'PENDING',
            metadata: {
                bankDetails
            }
        };

        await wallet.addTransaction(transactionData);

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: {
                balance: wallet.balance,
                transaction: wallet.transactions[wallet.transactions.length - 1]
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Withdraw funds error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal',
            error: error.message
        });
    }
};
