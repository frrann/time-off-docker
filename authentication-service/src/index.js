const mongoose = require('mongoose');
const fs = require('fs');

const app = require('./app');

const start = async () => {
    try {

        const pem = fs.readFileSync(`${__dirname}/rds-combined-ca-bundle.pem`);

        await mongoose.connect(process.env.MDBHOST, {
            useNewUrlParser: true,
            useFindAndModify: false,
            ssl: true,
            sslValidate: false,
            sslCA: [pem]
        });
    } catch (err) {
        console.log(err);
    }
    

    app.listen(3000, () => {
        console.log('Listening on port 3000!')
    })
}

start();