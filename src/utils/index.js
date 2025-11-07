import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
//its used to create the tokens
import jwt from 'jsonwebtoken';
//it is used to verify the token automatically
import { expressjwt } from 'express-jwt';
//this is used to parse token into cookies
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from '../config/db.js';
dotenv.config({ path: "../../.env" });
const app = express();

const Port = process.env.PORT || 5001;
app.use(cookieParser())

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, cb) {
    try {
      const userExist = await db.query(`SELECT * FROM users WHERE email=$1`, [profile.emails?.[0]?.value]);
      if (userExist.rows.length == 0) {
        await db.query(`INSERT INTO users (name,email,photo) VALUES ($1,$2,$3)`, [profile.displayName, profile.emails?.[0]?.value, profile.photos?.[0]?.value]);
        return cb(null, profile);
      } catch (error) {
        console.error("Error:", error);
        return cb(null, error);
      }


    }
));
app.use(passport.initialize());

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

//Here is the place where the user hit when they click on the signin with google button
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));
//and then passed here
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ name: user.displayName, email: user.emails?.[0]?.value, photo: user.photos?.[0]?.value }, process.env.JWT_SECRET, { expiresIn: "7d" });
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


app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`)
});