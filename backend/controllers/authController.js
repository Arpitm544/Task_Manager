const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../firebase');

// Sign up a new user
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Signup attempt for email:', email);

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ 
                message: user.authProvider === 'firebase' 
                    ? 'This email is already registered with Google login. Please use Google sign-in.'
                    : 'User already exists. Please login with email and password.'
            });
        }

        // Create new user with email provider
        user = new User({ 
            name, 
            email, 
            password,
            authProvider: 'email'
        });
        await user.save();
        console.log('New user created:', email);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                authProvider: 'email'
            } 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Server error during signup',
            error: error.message 
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password, token: firebaseToken } = req.body;
        console.log('Login attempt:', email ? 'Email login' : 'Google login');

        let user;

        // Handle Google/Firebase login
        if (firebaseToken) {
            try {
                console.log('Verifying Firebase token...');
                const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
                const { email: firebaseEmail, name: firebaseName } = decodedToken;
                console.log('Firebase token verified for:', firebaseEmail);

                // Find or create user
                user = await User.findOne({ email: firebaseEmail });
                
                if (!user) {
                    console.log('Creating new user for Google login:', firebaseEmail);
                    user = new User({
                        name: firebaseName || firebaseEmail.split('@')[0],
                        email: firebaseEmail,
                        password: Math.random().toString(36).slice(-8),
                        authProvider: 'firebase'
                    });
                    await user.save();
                } else {
                    console.log('Existing user found for Google login:', firebaseEmail);
                    if (user.authProvider !== 'firebase') {
                        console.log('User exists with email auth, rejecting Google login');
                        return res.status(400).json({ 
                            message: 'This email is registered with password. Please login with email and password instead of Google.'
                        });
                    }
                }
            } catch (firebaseError) {
                console.error('Firebase auth error:', firebaseError);
                return res.status(401).json({ 
                    message: 'Google authentication failed',
                    error: firebaseError.message
                });
            }
        } else {
            // Regular email/password login
            if (!email || !password) {
                console.log('Missing email or password');
                return res.status(400).json({ 
                    message: 'Email and password are required'
                });
            }

            console.log('Attempting email login for:', email);
            user = await User.findOne({ email });

            if (!user) {
                console.log('No user found with email:', email);
                return res.status(401).json({ 
                    message: 'Invalid email or password'
                });
            }

            if (user.authProvider === 'firebase') {
                console.log('User registered with Google, rejecting email login');
                return res.status(400).json({ 
                    message: 'This account uses Google login. Please sign in with Google.'
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                console.log('Invalid password for user:', email);
                return res.status(401).json({ 
                    message: 'Invalid email or password'
                });
            }
            console.log('Password match successful for:', email);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        console.log('JWT token generated for user:', user.email);

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                authProvider: user.authProvider
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: error.message 
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        console.log('Getting profile for user ID:', req.user._id);
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            console.log('No user found for ID:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Server error while getting profile',
            error: error.message 
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['name', 'password'];
      
      // Check for invalid fields in update request
      const isValidOperation = updates.every(field => allowedUpdates.includes(field));
      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates. Only name and password can be updated.' });
      }
  
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Prevent password update for Google/Firebase authenticated users
      if (user.authProvider === 'firebase' && updates.includes('password')) {
        return res.status(400).json({ message: 'Cannot update password for Google-authenticated users' });
      }
  
      // Apply updates
      updates.forEach(field => {
        user[field] = req.body[field];
      });
  
      // Save user (runs pre-save middleware like hashing password)
      await user.save();
  
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          authProvider: user.authProvider
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error while updating profile', error: error.message });
    }
  };

module.exports = {
    signup,
    login,
    getProfile,
    updateProfile
};