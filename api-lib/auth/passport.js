import {
  findUserForAuth,
  findUserWithEmailAndPassword,
  findUserByEmail,
  insertGoogleUser,
} from "@/api-lib/db";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getMongoDb } from "../mongodb";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((req, id, done) => {
  getMongoDb().then((db) => {
    findUserForAuth(db, id).then(
      (user) => done(null, user),
      (err) => done(err)
    );
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      const db = await getMongoDb();
      const user = await findUserWithEmailAndPassword(db, email, password);
      if (user) done(null, user);
      else done(null, false, { message: "Email or password is incorrect" });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const db = await getMongoDb();
      const user = await findUserByEmail(db, profile._json.email);
      if (user) done(null, user);
      else {
        const newUser = await insertGoogleUser(db, profile);
        console.log(newUser);
        done(null, newUser);
      }
    }
  )
);

export default passport;
