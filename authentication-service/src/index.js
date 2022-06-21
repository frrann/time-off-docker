const mongoose = require('mongoose');

const app = require('./app');

const start = async () => {
    try {
        await mongoose.connect(process.env.MDBHOST, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!')
    })
}

start();