const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

/* 
@route  GET api/profile/me
@desc   Get the current profile logged in
@access Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(404)
        .json({ msg: 'There is not profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).sed('Server Error');
  }
});

/* 
@route  POST api/profile
@desc   Create or edit current profile
@access Private
 */

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').notEmpty(),
      check('skills', 'Skills is required').notEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubname,
      facebook,
      youtube,
      linkedin,
      twitter,
      instagram,
      date
    } = req.body;

    //Build Profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (skills)
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    if (bio) profileFields.bio = bio;
    if (githubname) profileFields.githubname = githubname;

    //build object social
    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;

    if (date) profileFields.date = date;

    try {
      let profile = await Profile.findById(req.user.id);
      if (profile) {
        //Update
        profile = await Profile.findByIdAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      } else {
        //Create
        profile = new Profile(profileFields);
        await profile.save();

        return res.json(profile);
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).send('Internal server error');
    }
  }
);

/* 
@route  GET api/profile
@desc   Get all profiles
@access Public
 */
router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});

/* 
@route  GET api/profile/user/:user_id
@desc   Get a specific profile
@access Public
 */
router.get('/user/:user_id', async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});
module.exports = router;
