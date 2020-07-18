if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
  const express = require("express");
  const app = express();
  const bcrypt = require("bcrypt");
  const passport = require("passport");
  const flash = require("express-flash");
  const session = require("express-session");
  const methodOverride = require("method-override");
  const port = process.env.PORT || 3000
  
  
  app.use(express.static(__dirname + "/public"));
  
  //ROUTES
  const studentRouter = require("./routes/student");
  const adminRouter = require("./routes/admin");
  
  // USER MODEL
  const User = require("./models/users");
  const Event = require("./models/event");
  const Story = require("./models/story");
  
  
  // MONGO
  const mongoose = require("mongoose");
  
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("connected"))
    .catch((err) => console.log(err));
  
  // PASSPORT
  require("./passport-config")(passport);
  
  // EJS
  app.set("view-engine", "ejs");
  
  // BODY-PARSER
  app.use(express.urlencoded({ extended: false, limit:'5mb' }));
  
  // USE
  app.use(flash());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));
  
  // INDEX
  app.get("/", async (req, res) => {
    const event = await Event.find({category: "recent"}).sort({ date: -1 }).limit(9);
    res.render("index.ejs", { event: event });
  });
  
  // SIGN-IN
  app.get("/signin", checkNotAuthenticated, (req, res) => {
    res.render("signin.ejs");
  });
  
  app.post(
    "/signin",
    checkNotAuthenticated,
    passport.authenticate("local", {
      failureRedirect: "/signin",
      failureFlash: true,
    }),
    redirectUrl
  );
  
  // SIGN-UP
  app.get("/signup", checkNotAuthenticated, (req, res) => {
    res.render("signup.ejs");
  });
  
  app.post("/signup", checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      console.log(user);
      user.save();
      res.redirect("/signin");
    } catch {
      res.redirect("/signup");
    }
  });
  
  // SIGN-OUT
  app.delete("/signout", (req, res) => {
    req.logOut();
    res.redirect("/");
  });
  
  // MIDDLEWARE
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect("/signin");
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  }
  
  function redirectUrl(req, res) {
    if (!req.user) {
      return res.redirect("signin");
    } else if (req.user.role == "admin") {
      return res.redirect("/admin/event");
    } else {
      return res.redirect("/student/event");
    }
  }
  
  function checkAdmin(req, res, next) {
    if (req.user.role != "admin") {
      return res.redirect("/student/event");
    }
    next();
  }
  
  function checkStudent(req, res, next) {
    if (req.user.role != "student") {
      return res.redirect("/admin/event");
    }
    next();
  }
  
  app.use("/student/story", studentRouter);
  app.use("/admin/event", adminRouter);

app.get("/student/event", checkAuthenticated, checkStudent, async (req, res) => {
    const event = await Event.find({category: "recent"}).sort({ date: -1 });
    const uevent = await Event.find({category: "upcoming"}).sort({ date: 1 }).limit(3);
    res.render("student-ejs/event-student.ejs", { event: event, uevent:uevent,user: req.user.name  });
  });

  app.get("/admin/story", checkAuthenticated, checkAdmin, async (req, res) => {
    const story = await Story.find();
    res.render("admin-ejs/story-admin.ejs", { story: story});
  });
  
  //EVENT SHOW
app.get("/student/event/:id", checkAuthenticated, checkStudent, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event == null) res.redirect("/student/event");
    res.render("student-ejs/show-event-student.ejs", { event: event, user:req.user.name  });
  } catch (error) {
    res.redirect("/student/event");
  }
});
  
  app.listen(port);
  