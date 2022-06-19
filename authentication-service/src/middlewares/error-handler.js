const errorHandler = function (err, req, res, next) {
    console.error(err);
    res.status(400).send({
        errors: [
            {
                message: "Something went wrong"
            }
        ]
    })
};

module.exports = { errorHandler }