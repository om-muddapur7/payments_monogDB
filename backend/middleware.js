const jwt = require('jsonwebtoken')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

function authMiddleware(req, res, next){
    const token = req.headers.token;
    if(!token){
        return res.status(403).json({
            message: "invalid token"
        })
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    if(userId){
        req.userId = userId;
        next();
    }
    else{
        return res.status(403).json({
            message: "crendentials doesnt match"
        })
    }
}

module.exports = {
    authMiddleware: authMiddleware
}