const { decodeToken } = require("../helper/jwt");

const authenthication_user = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw { name: "NoTokenProvided", message: "Authorization header is missing" };
        }

        const token = authHeader.split(' ')[1]; // This extracts the token part

        if (!token) {
            throw { name: "Invalid token", message: "Token not found" };
        }

        const { user } = await decodeToken(token);

        if (!user) {
            throw { name: "Invalid token", message: "Invalid user" };
        }

        req.user = { ...user };
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenthication_user;
