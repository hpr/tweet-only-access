const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Sequelize = require("sequelize");
const TwitterStrategy = require("passport-twitter").Strategy;
const path = require("path");
const crypto = require("crypto");
const { TwitterClient } = require('twitter-api-client');

let port = process.env.PORT || 3000;
const prod = process.env.NODE_ENV === "production";
if (process.env.NODE_ENV === "development") require("../secrets.js");

const db = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
  ssl: prod,
  dialectOptions: prod
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});
const User = db.define("user", {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  accessToken: Sequelize.STRING,
  accessTokenSecret: Sequelize.STRING,
  twitterId: Sequelize.STRING,
  urlCode: {
    type: Sequelize.STRING,
    unique: true,
  },
});

const createApp = () => {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: "http://localhost:3000/auth/twitter/callback",
      },
      async (accessToken, accessTokenSecret, profile, cb) => {
        try {
          const [user] = await User.findOrCreate({
            where: {
              twitterId: profile.id,
            },
            defaults: {
              username: profile.username,
              accessToken,
              accessTokenSecret,
              urlCode: crypto.randomBytes(32).toString("hex"),
            },
          });
          cb(null, user);
        } catch (err) {
          cb(err);
        }
      }
    )
  );

  app.get("/auth/twitter", passport.authenticate("twitter"));

  app.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect(`/${req.user.urlCode}`);
    }
  );

  app.post("/api/tweet", async (req, res, next) => {
    try {
      const tweeter = await User.findOne({
        where: { urlCode: req.body.urlCode },
      });
      const twitterClient = new TwitterClient({
        apiKey: process.env.TWITTER_CONSUMER_KEY,
        apiSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: tweeter.accessToken,
        accessTokenSecret: tweeter.accessTokenSecret
      });
      const data = await twitterClient.tweets.statusesUpdate({
        status: req.body.tweet
      });
      res.send(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/tweeter/:urlCode", async (req, res, next) => {
    try {
      const tweeter = await User.findOne({
        where: { urlCode: req.params.urlCode },
      });
      res.send({
        username: tweeter.username
      });
    } catch (err) {
      next(err);
    }
  });

  if (prod) {
    app.use(express.static(path.join(__dirname, "../build")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });
  } else {
    port = 3001;
  }
  return app;
};

if (module === require.main) {
  const app = createApp();
  db.sync();
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = { db };
