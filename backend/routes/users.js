const router = require('express').Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const { response } = require('express');
let User = require('../models/user.model');
const { authenticateToken } = require('../auth');

const { isRouteErrorResponse } = require('react-router-dom');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/register').post((request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        username: request.body.username,
        password: hashedPassword,
      });
      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
            alert:"Thanks you for registering " . username,


          });

        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
            alert:"An error has triggered, please try again. If the issue keeps happening contact admin",
            

          });

        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
        alert:"An error has triggered with the password hashing, please try again. If the issue keeps happening contact admin",

      });

    });

});

// login endpoint
router.route("/login").post((request, response) => {
  // check if email exists
  User.findOne({ username: request.body.username })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)


        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            response.status(400).send({
              message: "Passwords does not match",
              error,
              alert: message
            });

          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userName: user.username,
            },
            "RANDOM-TOKEN",
            { expiresIn: "1h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            username: user.username,
            token,
          });
          
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords do not match",
            error,
          });

        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
router.route("/free-endpoint").get((request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.route("/create-image").get(authenticateToken, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

module.exports = router;