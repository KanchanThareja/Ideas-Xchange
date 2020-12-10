const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
        email: req.body.email,
        password: hash
        });

        user.save().then(result => {
        res.status(201).json({
            message: "User created",
            result: result
        });
        })
        .catch(err => {
        res.status(500).json({
            error: err
        });
        });
    });
};

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
    .then(user => {
      fetchedUser = user;
  
      if(!user) {
        return res.status(401).json({
          message: "Auth Failed"
        });
      }
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if(!result) {
        return res.status(401).json({
          message: "Auth Failed"
        })
      }
  
      const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id}, 'secret_mean_app_key_which_is_longer',
      {expiresIn: "1h"});
  
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Auth Failed"
      })
    });
  };