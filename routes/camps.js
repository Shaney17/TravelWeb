var express     = require("express");
var router      = express.Router();
var Campgrounds = require("../models/campground.js");
var middleware  = require("../middleware/index.js");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campgrounds.find({}, function(err, campgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/camps",{campground:campgrounds, currentUser:req.user});
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
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
   Campgrounds.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, resources: {}});
        }
    });
});

//EDIT CAMPGROUND 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    //is user logged in ?
    Campgrounds.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
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


module.exports = router;