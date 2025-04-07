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

// Add funds to wallet
exports.addFunds = async (req, res) => {
  try {
    console.log('Add funds request received:', {
      body: req.body,
      user: req.user
    });

    const { amount, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Validate request data
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Validate payment method
    if (!paymentMethod) {
      console.error('Payment method missing');
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Find user's wallet
    let wallet = await Wallet.findOne({ userId });
    console.log('Found wallet:', wallet ? 'Yes' : 'No');
    
    if (!wallet) {
      console.log('Creating new wallet for user:', userId);
      // Create new wallet if it doesn't exist
      wallet = new Wallet({
        userId,
        balance: 0,
        transactions: []
      });
    }

    // Create transaction record
    const transaction = {
      type: 'CREDIT',
      amount: Number(amount),
      description: `Added funds via ${paymentMethod}`,
      reference: `ADD-${Date.now()}`,
      status: 'COMPLETED',
      metadata: {
        paymentMethod
      }
    };

    console.log('Adding transaction:', transaction);
    
    try {
      await wallet.addTransaction(transaction);
      console.log('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Funds added successfully',
      data: {
        balance: wallet.balance,
        transaction
      }
    });
  } catch (error) {
    console.error('Add funds error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Failed to add funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Withdraw funds from wallet
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      amount,
      type: 'debit',
      reason: 'Withdrawal request',
      balanceAfter: user.walletBalance - amount,
      status: 'pending',
      metadata: { bankDetails }
    });

    // Update wallet balance
    user.walletBalance -= amount;
    await user.save();
    await transaction.save();

    res.status(200).json({
      message: 'Withdrawal request submitted successfully',
      balance: user.walletBalance,
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing withdrawal', error: err.message });
  }
};

// Get transaction history with filters
exports.getTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, type, status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    let filter = { userId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transaction history', error: err.message });
  }
};

