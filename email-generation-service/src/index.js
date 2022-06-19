const app = require('./app');

const start = async () => {
    app.listen(4000, () => {
        console.log('Listening on port 4000!')
    })
}

start();