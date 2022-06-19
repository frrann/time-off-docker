const express = require('express');
const { json } = require('body-parser');
const cookieSession = require('cookie-session');

const { currentUserRouter } = require('./routes/current-user');
const { signinRouter } = require('./routes/signin');
const { signoutRouter } = require('./routes/signout');
const { signupRouter } = require('./routes/signup');
const { errorHandler } = require('./middlewares/error-handler')

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: false
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', (req, res) => {
    throw new Error("Not Found");
});

app.use(errorHandler);

module.exports = app;