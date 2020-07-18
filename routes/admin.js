const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

//MAIN
router.get("/", checkAuthenticated, checkAdmin, async (req, res) => {
  const event = await Event.find({category: "recent"}).sort({ date: -1 });
  const uevent = await Event.find({category: "upcoming"}).sort({ date: 1 });
  res.render("admin-ejs/event-admin.ejs", { event: event, uevent:uevent });
});

//ADD
router.post(
  "/",
  async (req, res, next) => {
    req.event = new Event();
    next();

  },
  saveStoryAndRedirect("admin-ejs/add-event-admin.ejs")
);

//ADD
router.get("/add", checkAuthenticated, checkAdmin, async (req, res) => {
  res.render("admin-ejs/add-event-admin.ejs", { event: new Event() });
})

//SHOW
router.get("/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event == null) res.redirect("/admin/event");
    res.render("admin-ejs/show-event-admin.ejs", { event: event });
  } catch (error) {
    res.redirect("/admin/event");
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.redirect("/admin/event");
});

//EDIT
router.get("/edit/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.render("admin-ejs/edit-event-admin.ejs", { event: event });
  } catch (error) {
    res.redirect("/admin/event/");
  }
});

//EDIT
router.put(
  "/:id",
  async (req, res, next) => {
    req.event = await Event.findById(req.params.id);
    next();
  },
  saveStoryAndRedirect("admin-ejs/edit-event-admin.ejs")
);

function saveStoryAndRedirect(path) {
  return async (req, res) => {
    let event = req.event;
    event.name = req.body.name;
    event.date = req.body.date;
    event.category = req.body.category;
    event.description = req.body.description;
    saveCover(event, req.body.cover)
    try {
      event = await event.save();
      res.redirect(`/admin/event/${event.id}`);
    } catch (e) {
      res.render(path, { event: event });
    }
  };
}

function saveCover(event, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    event.coverImage = new Buffer.from(cover.data, 'base64')
    event.coverImageType = cover.type
  }
}

function checkAdmin(req, res, next) {
  if (req.user.role != "admin") {
    return res.redirect("/student/event");
  }
  next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/signin");
}
module.exports = router;
