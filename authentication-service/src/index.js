const mongoose = require('mongoose');
const fs = require('fs');

const app = require('./app');

const start = async () => {
    try {
        await mongoose.connect(process.env.MDBHOST, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useNewUrlParser: true,
            ssl: true,
            sslValidate: false,
            sslCA: fs.readFileSync('./../conf/rds-combined-ca-bundle.pem')
        });
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!')
    })
}

start();