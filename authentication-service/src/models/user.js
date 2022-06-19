const mongoose = require('mongoose');

const { Password } = require('../services/password');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
            },
            versionKey: false
        }
    }
);

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
});

userSchema.statics.build = (email, password) => {
    return new User({ email, password });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };