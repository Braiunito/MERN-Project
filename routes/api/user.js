const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');

const User = require('../../models/User');

/* 
@route  Post api/user
@desc   Create users
@access Public
 */
router.post(
  '/',
  [
    check('name', 'The field is required, Cannot be empty')
      .not()
      .isEmpty(),
    check('email', 'The email is invaild').isEmail(),
    check(
      'password',
      'Please select a password upper to 6 characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const { name, email, password } = req.body;

    try {
      // User exist
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ error: [{ msg: 'This user already exist' }] });
      }

      // Get gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
