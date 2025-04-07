const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
    try {
        console.log('Verifying token...');
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');
        
        // Handle different token formats
        let token;
        if (authHeader) {
            // Could be "Bearer <token>" or just "<token>"
            token = authHeader.startsWith('Bearer ') 
                ? authHeader.slice(7) 
                : authHeader;
        }

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        console.log('Verifying token with JWT_SECRET...');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully:', decoded);
            
            // Find the user
            const user = await User.findById(decoded.userId);
            console.log('User found:', user ? 'Yes' : 'No');

            if (!user) {
                console.log('User not found for ID:', decoded.userId);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check user status
            if (user.status && user.status !== 'ACTIVE') {
                console.log('User account not active. Status:', user.status);
                return res.status(403).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            console.log('Authentication successful for user:', user.name);
            // Add user role to the request object
            req.user = {
                ...decoded,
                role: user.role
            };
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: jwtError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token',
            error: error.message
        });
    }
};

// Role-based access control middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log('User role:', req.user.role);
        console.log('Required roles:', roles);
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Unauthorized access: Role ${req.user.role} not in ${roles.join(', ')}`
            });
        }
        next();
    };
};
