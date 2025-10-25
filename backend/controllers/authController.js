const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email); // LOG

    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.log('❌ Registration failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      where: { email }
    });

    if (userExists) {
      console.log('❌ Registration failed: Email already exists -', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({
      where: { username }
    });

    if (usernameExists) {
      console.log('❌ Registration failed: Username taken -', username);
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Create user (password will be hashed automatically by the model hook)
    const user = await User.create({
      username,
      email,
      password,
      role: 'user' // Default role
    });

    // Generate token
    const token = generateToken(user.id);

    console.log('✅ Registration successful:', user.email, '- Role:', user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email); // LOG

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Login failed: Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      console.log('❌ Login failed: User not found -', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Login failed: Wrong password -', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    console.log('✅ Login successful:', user.email, '- Role:', user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    console.log('👤 Get user profile:', req.user.id); // LOG

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    console.log('✅ Profile fetched:', user.email);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};