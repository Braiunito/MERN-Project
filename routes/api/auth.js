const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
/* 
@route  GET api/auth
@desc   Test route
@access Public
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* 
@route  Post api/user
@desc   Login users
@access Public
 */
router.post(
  '/',
  [
    check('email', 'The email is invaild').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const { email, password } = req.body;

    try {
      // User exist
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: [{ msg: 'Invalid credentials' }] });
      }

      const isValid = await bcrypt.compare(password, user.password);

      // Verify credentials
      if (!isValid) {
        return res
          .status(400)
          .json({ error: [{ msg: 'Invalid credentials' }] });
      }

      // Return JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
    }
  }
);

module.exports = router;
