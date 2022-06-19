const express = require('express');
const { json } = require('body-parser');

const { generateEmailRouter } = require('./routes/generate-email');
const { errorHandler } = require('./middlewares/error-handler')

const app = express();
app.set('trust proxy', true);

app.use(json());

app.use(generateEmailRouter);

app.all('*', (req, res) => {
    throw new Error("Not Found");
});

app.use(errorHandler);

module.exports = app;