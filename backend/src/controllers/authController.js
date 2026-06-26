const userRepository = require('../repositories/userRepository');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class AuthController {
  // Signup
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          error: 'An account with this email already exists',
          suggestion: 'Please try logging in instead.'
        });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const user = await userRepository.create({
        name,
        email,
        password,
        verificationToken
      });

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Store refresh token
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Print mock email verification link to console for debugging/portfolio presentation
      console.log(`[MAIL MOCK] Verification link for ${user.email}: http://localhost:3000/api/verify-email?token=${verificationToken}`);

      res.status(201).json({
        success: true,
        token: accessToken,
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, credits: user.credits },
        message: 'Account created successfully! Welcome to AI Thumbnail Studio.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await userRepository.findByEmail(email, true);
      if (!user) {
        return res.status(401).json({ error: 'No account found with this email address' });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Store refresh token
      user.refreshTokens.push(refreshToken);
      // Limit stored sessions to 5 max
      if (user.refreshTokens.length > 5) {
        user.refreshTokens.shift();
      }
      await user.save();

      res.json({
        success: true,
        token: accessToken,
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, credits: user.credits },
        message: `Welcome back, ${user.name}!`
      });
    } catch (err) {
      next(err);
    }
  }

  // Refresh Token
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_change_me');
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      const user = await userRepository.findById(decoded.id);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }

      const newAccessToken = user.generateAccessToken();
      res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Profile
  async getProfile(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          isVerified: user.isVerified
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Forgot Password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'No account associated with this email.' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      await user.save();

      console.log(`[MAIL MOCK] Password reset token for ${user.email}: ${resetToken}`);

      res.json({
        success: true,
        message: 'Password reset link sent to your email (check server logs for mock link).'
      });
    } catch (err) {
      next(err);
    }
  }

  // Reset Password
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await userRepository.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired password reset token' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset completed successfully. You can now log in.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Verify Email
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).json({ error: 'Token is required' });

      const user = await userRepository.findOne({ verificationToken: token });
      if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully! Your account is active.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const user = await userRepository.findById(req.user.id);
      if (user && refreshToken) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
