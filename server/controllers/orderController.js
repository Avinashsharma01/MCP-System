const Order = require('../models/Order');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const {
            customerId,
            pickupLocation,
            amount,
            scheduledTime,
            customerNotes
        } = req.body;

        // Validate MCP
        const mcp = await User.findById(req.user.userId);
        if (mcp.role !== 'MCP') {
            return res.status(403).json({
                success: false,
                message: 'Only MCPs can create orders'
            });
        }

        // Calculate commission (you can modify this based on your business logic)
        const commission = amount * 0.1; // 10% commission

        const order = new Order({
            mcpId: mcp._id,
            customerId,
            pickupLocation,
            amount,
            commission,
            scheduledTime,
            customerNotes,
            status: 'PENDING'
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Assign order to pickup partner
exports.assignOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId, partnerId } = req.body;

        // Validate MCP
        const mcp = await User.findById(req.user.userId);
        if (mcp.role !== 'MCP') {
            throw new Error('Only MCPs can assign orders');
        }

        // Validate order
        const order = await Order.findOne({
            _id: orderId,
            mcpId: mcp._id,
            status: 'PENDING'
        });

        if (!order) {
            throw new Error('Order not found or not assignable');
        }

        // Validate pickup partner
        const partner = await User.findOne({
            _id: partnerId,
            role: 'PICKUP_PARTNER',
            mcpId: mcp._id,
            status: 'ACTIVE'
        });

        if (!partner) {
            throw new Error('Invalid pickup partner');
        }

        // Assign order
        await order.assignPartner(partnerId);

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Order assigned successfully',
            data: { order }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Assign order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning order',
            error: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId, status, notes } = req.body;

        // Find order and validate access
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        const user = await User.findById(req.user.userId);
        if (user.role === 'PICKUP_PARTNER' && order.pickupPartnerId.toString() !== user._id.toString()) {
            throw new Error('Unauthorized to update this order');
        }

        if (user.role === 'MCP' && order.mcpId.toString() !== user._id.toString()) {
            throw new Error('Unauthorized to update this order');
        }

        // Update order status
        await order.updateStatus(status, notes);

        // If order is completed, process payment
        if (status === 'COMPLETED') {
            const partnerWallet = await Wallet.findOne({ userId: order.pickupPartnerId });
            if (!partnerWallet) {
                throw new Error('Partner wallet not found');
            }

            // Deduct amount from partner's wallet
            await partnerWallet.addTransaction({
                type: 'DEBIT',
                amount: order.amount,
                description: `Payment for order ${order._id}`,
                reference: `ORD-${order._id}`,
                status: 'COMPLETED',
                metadata: {
                    orderId: order._id
                }
            });

            // Update order payment status
            order.paymentStatus = 'COMPLETED';
            await order.save();
        }

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Get orders with filters
exports.getOrders = async (req, res) => {
    try {
        const {
            status,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (page - 1) * limit;
        const query = {};

        // Apply filters based on user role
        const user = await User.findById(req.user.userId);
        if (user.role === 'MCP') {
            query.mcpId = user._id;
        } else if (user.role === 'PICKUP_PARTNER') {
            query.pickupPartnerId = user._id;
        }

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.scheduledTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ scheduledTime: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('customerId', 'name phone')
                .populate('pickupPartnerId', 'name phone'),
            Order.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('customerId', 'name phone')
            .populate('pickupPartnerId', 'name phone')
            .populate('mcpId', 'name phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate access
        const user = await User.findById(req.user.userId);
        if (
            (user.role === 'PICKUP_PARTNER' && order.pickupPartnerId?.toString() !== user._id.toString()) ||
            (user.role === 'MCP' && order.mcpId.toString() !== user._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this order'
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details',
            error: error.message
        });
    }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        // Apply filters based on user role
        const user = await User.findById(req.user.userId);
        if (user.role === 'MCP') {
            query.mcpId = user._id;
        } else if (user.role === 'PICKUP_PARTNER') {
            query.pickupPartnerId = user._id;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' }
                }
            }
        ]);

        const formattedStats = {
            total: 0,
            totalAmount: 0,
            totalCommission: 0,
            byStatus: {}
        };

        stats.forEach(stat => {
            formattedStats.total += stat.count;
            formattedStats.totalAmount += stat.totalAmount;
            formattedStats.totalCommission += stat.totalCommission;
            formattedStats.byStatus[stat._id] = {
                count: stat.count,
                amount: stat.totalAmount,
                commission: stat.totalCommission
            };
        });

        res.json({
            success: true,
            data: formattedStats
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order statistics',
            error: error.message
        });
    }
}; 