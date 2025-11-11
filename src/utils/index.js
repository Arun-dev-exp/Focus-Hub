import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
//its used to create the tokens
import jwt from 'jsonwebtoken';
//it is used to verify the token automatically
import { expressjwt } from 'express-jwt';
//this is used to parse token into cookies
import cookieParser from 'cookie-parser';
//using user model
import User from "../models/User.js"
import dotenv from 'dotenv';
import db from '../config/db.js';
dotenv.config({ path: "../../.env" });
const app = express();
db();
const Port = process.env.PORT || 5001;
app.use(cookieParser())

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, cb) {
    try {
      let userExist = await User.findOne({ email: profile.emails?.[0]?.value });
      if (userExist) {
        return cb(null, userExist);
      }

      //If we don't see userExist then we create a new User
      const newUser = User.create({
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        photo: profile.photos?.[0]?.value,
      });
      return cb(null, newUser);
    } catch (error) {
      console.error("Error:", error);
      return cb(null, error);
    }
  }
));
app.use(passport.initialize());



//Here is the place where the user hit when they click on the signin with google button
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));
//and then passed here
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({
      name: user.name,
      email: user.email,
      photo: user.photo
    },
      process.env.JWT_SECRET,
      { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ message: " Logged in successfully!", user });
  });

app.get('/auth/failure', (req, res) => {
  res.status(401).json({ message: "Google authentication failed" })
});

//it verifies the token automatically
app.use(
  expressjwt(
    {
      secret: process.env.JWT_SECRET,
      algorithms: ['HS256'],
      getToken: req => req.cookies.token,
    }
    //its like we if the user come through this there will be no verification as no token is issued yet
  ).unless({ path: ["/auth/google", "/auth/google/callback"] })
);



app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`)
});