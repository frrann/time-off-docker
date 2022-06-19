const jwt = require('jsonwebtoken');

function currentUser(req, res, next) {
    if (!req.session?.jwt) {
        return next();
    }
    try {
        const payload = jwt.verify(req.session.jwt, "privateKey123")
        req.currentUser = payload;
    } catch (err) { }
    next();
}

module.exports = { currentUser }