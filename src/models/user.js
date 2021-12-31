const validator = require('validator')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Email is invalid')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [6, 'Password is too short'],
        validate(value) {
            if(value.toLowerCase().includes('password'))
                throw new Error('Password can not contain "password"')
        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0)
                throw new Error('Age must be a positive number')
        }
    },
    avatar : {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function() {
    const user = this

    const token = jwt.sign({_id: user._id.toString()}, 'thisismynewcourse')
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

//Apagar quando necessario 
userSchema.methods.toJSON = function() {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Has the plain text word before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()
})

//delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User