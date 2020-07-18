const express = require("express");
const router = express.Router();
const Story = require("../models/story");
const Event = require("../models/event");
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

//MAIN
router.get("/", checkAuthenticated, checkStudent, async (req, res) => {
  const story = await Story.find();
  res.render("student-ejs/story-student.ejs", { story: story, user: req.user.name });
});

//ADD
router.post(
  "/",
  async (req, res, next) => {
    let story = new Story({
      description : req.body.description,
      name : req.user.name,
      code : req.user.id
    })
    saveCover(story, req.body.cover)


    try {
      story = await story.save();
      res.redirect("/student/story/mystory");
    } catch (e) {
      res.render("student-ejs/add-student-story.ejs", { story: story });
    }
  }
);

//ADD
router.get("/add", checkAuthenticated, checkStudent, async (req, res) => {

  res.render("student-ejs/add-story-student.ejs", { story: new Story(), user:req.user.name});

});

//MYSTORY
router.get("/mystory", checkAuthenticated, checkStudent, async (req, res) => {
  const story = await Story.find({code: req.user.id});
 
  res.render("student-ejs/my-story-student.ejs", { story: story, user:req.user.name});


});


//DELETE
router.delete("/:id", async (req, res) => {
  await Story.findOneAndDelete( {_id: req.params.id});
  res.redirect("/student/story/mystory");
});

//EDIT
router.get("/edit/:id", checkAuthenticated, checkStudent, async (req, res) => {
  try {
    const story = await Story.findOne({_id: req.params.id});
    res.render("student-ejs/edit-story-student.ejs", { story: story, user:req.user.name });
  } catch (error) {
    res.redirect("/student/story/mystory");
  }
 
});

//EDIT
router.put(
  "/:id",
  async (req, res, next) => {
    console.log(req.body.description)
    req.story = await Story.findOne({_id: req.params.id});
    console.log(req.story)
    next();
  },
  saveStoryAndRedirect("student-ejs/edit-story-student.ejs")
);






function saveStoryAndRedirect(path) {
  return async (req, res) => {
    let story = req.story;
    story.description = req.body.description;
    saveCover(story, req.body.cover)
    try {
      story = await story.save();
      res.redirect(`/student/story/mystory`);
    } catch (e) {
      res.render(path, { story: story });
    }
  };
}


function saveCover(story, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    story.coverImage = new Buffer.from(cover.data, 'base64')
    story.coverImageType = cover.type
  }
}

function checkStudent(req, res, next) {
  if (req.user.role != "student") {
    return res.redirect("/admin/event");
  }
  next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
}
module.exports = router;
