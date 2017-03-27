var express     = require("express");
var router      = express.Router();
var Campgrounds = require("../models/campground.js");
var User = require("../models/user.js");
var middleware  = require("../middleware/index.js");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campgrounds.find({}, function(err, campgrounds){
       if(err){
           console.log(err);
       } else {
            res.render("campgrounds/camps.html",{campground:campgrounds, currentUser:req.user});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name    = req.body.name;
    var price   = req.body.price;
    var image   = req.body.image;
    var desc    = req.body.description;
    var author  = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: desc, author:author};
    
    //check empty value
    var checkEmptyValue = false;
    for(var key in newCampground){
        if(newCampground[key] === ""){
            checkEmptyValue = true;
        }
    }
    if(checkEmptyValue){
        req.flash("error", "You must fill all information");
        res.redirect("back");
    } else {
        // Create a new campground and save to DB
        Campgrounds.create(newCampground, function(err, newlyCreated){
            if(err){
                req.flash("error", "Something went wrong !");
                console.log(err);
            } else {
                req.flash("success", "Successfully added Campground !");
                //redirect back to campgrounds page
                res.redirect("/camps");
            }
        });
    }
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new.html"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
   Campgrounds.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show.html", {campground: foundCampground, resources: {}});
        }
    });
});

//EDIT CAMPGROUND 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    //is user logged in ?
    Campgrounds.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit.html", {campground: foundCampground});
    });
});


//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campgrounds.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           console.log(err);
       } else {
           req.flash("success", "Edited Campground");
           res.redirect("/camps/" + req.params.id);
       }
   }); 
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campgrounds.findByIdAndRemove(req.params.id, function(err){
      if(err){
          console.log(err);
          res.redirect("/camps");
      } else {
          req.flash("success", "Deleted Campground");
          res.redirect("/camps");
      }
   });
});

//ADD GUEST IMG TO CAMPGROUND
    //get guest img post form
router.get("/:id/newGuestImg", middleware.isLoggedIn, function(req, res) {
    Campgrounds.findById(req.params.id, function(err, foundCampground) {
       if(err){
           req.flash("error", "Campground not found !");
           res.redirect("/camps");
       } else {
           res.render("campgrounds/newGuestImg.html", {campground:foundCampground});
       }
    });
});
    //save guest img to campground
router.put("/:id/newGuestImg", middleware.isLoggedIn, function(req, res){
    Campgrounds.findByIdAndUpdate(req.params.id, {$push: {"guestImg": req.body.guestImg}} , function(err, foundCampground) {
       if(err){
           req.flash("error", "Campground not found !");
           res.redirect("/camps");
       } else {
           res.redirect("/camps/" + req.params.id);
       }
    });
});


//SAVE CAMPGROUND FOR USER
router.post("/:id/saveCampground", middleware.isLoggedIn, function(req, res){
    Campgrounds.findById(req.params.id, function(err, foundCampground) {
       if(err) {
           req.flash("error", "Campground not found !");
           res.redirect("/camps");
       } else {
            var user = req.user;
            if(user.campgrounds.indexOf(foundCampground._id) < 0) {
               user.campgrounds.push(foundCampground);
               user.save();
               req.flash("success", "Saved campground !");
               res.redirect("/camps");
            } else {
               req.flash("error", "You saved that campground before !");
               res.redirect("/camps");
            }
       }
    });
});

//SHOW SAVED CAMPGROUNDS FOR USER
router.get("/:user_id/savedCampground", middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.user_id).populate("campgrounds").exec(function(err, foundUser){
            if(err) {
                console.log(err);
            } else {
                res.render("campgrounds/savedCampgrounds.html", {user:foundUser, resources: {}});
            }
    });
});

//DELETE SAVED CAMPGROUND
router.put("/:user_id/savedCampground/:camp_id",middleware.isLoggedIn, function(req, res){
    Campgrounds.findById(req.params.camp_id, function(err, foundCampground) {
       if(err) {
           res.flash("error", "Campground not found !");
           res.redirect("/camps/" + user._id + "/savedCampground");
       } else {
           var user = req.user;
           user.campgrounds.splice(user.campgrounds.indexOf(foundCampground.id), 1);
            User.findByIdAndUpdate(req.params.user_id, user, function(err, foundUser){
                if(err) {
                    res.flash("Something went wrong !");
                    res.redirect("/camps/" + user._id + "/savedCampground");
                } else {
                    res.redirect("/camps/" + user._id + "/savedCampground");
                }
            })
       }
    });
});

module.exports = router;