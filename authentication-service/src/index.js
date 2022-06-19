const mongoose = require('mongoose');

const app = require('./app');

const start = async () => {
    try {
        await mongoose.connect('mongodb://mongo:27018', {
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