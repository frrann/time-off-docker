const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');

const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters')
    ],
    async (req, res, next) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            next(new Error('Email in use'));
        }

        const user = User.build(email, password);
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        },
            "privateKey123"
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        return res.status(201).send(user);
    }
);

module.exports = { signupRouter: router };