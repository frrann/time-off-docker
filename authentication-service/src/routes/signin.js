const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');
const { Password } = require('../services/password');

const router = express.Router();

router.post(
    '/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    async (req, res) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            next(new Error('Invalid credentials'));
        }

        const passwordMatch = await Password.compare(existingUser.password, password);
        if (!passwordMatch) {
            next(new Error('Invalid credentials'));
        }

        // Generate JWT
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        },
            "privateKey123"
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        return res.status(200).send(existingUser);
    });

module.exports = { signinRouter: router };