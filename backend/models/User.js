const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider === 'email';
        },
        minlength: 6
    },
    authProvider: {
        type: String,
        required: true,
        enum: ['email', 'firebase'],
        default: 'email'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password') && this.authProvider === 'email') {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(password) {
    try {
        if (this.authProvider !== 'email') {
            console.log('Non-email auth provider, password comparison failed');
            return false;
        }
        const isMatch = await bcrypt.compare(password, this.password);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
    try {
        const user = await this.findOne({ email, authProvider: 'email' });
        if (!user) {
            console.log('No user found with email:', email);
            return null;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password does not match for user:', email);
            return null;
        }

        return user;
    } catch (error) {
        console.error('Find by credentials error:', error);
        return null;
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;