const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    isAuthorized: async (req,res,next) => {
        const token = req.query.token;
        if (!token) {
            return res.json({
                status: false,
                error: 'Unauthorized: No token provided',
            });
        }
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.json({
                status: false,
                error: 'Unauthorized: Invalid token',
            });
        }
    }
}