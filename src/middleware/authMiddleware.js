import { expressjwt } from 'express-jwt';
import express from 'express';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser());

app.use(
    expressjwt({
        secret: process.env.JWT_SECRET,
        algorithms: ["HS256"],
        getToken: req => req.cookies.token
    }).unless({ path: ["/auth/google", "/auth/google/callback"] })
);