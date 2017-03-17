var express     = require("express");
var router      = express.Router({mergeParams:true});
var Campgrounds = require("../models/campground.js");
var Comment     = require("../models/comment.js");
var middleware  = require("../middleware");

//show add comment page
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campgrounds.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/newComment", {campground: campground});
        }
    });
});

//post a new comment
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup campground using ID
   Campgrounds.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           req.flash("error", "Campground not found !");
           res.redirect("/camps");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong !");
               console.log(err);
           } else {
               //add id and username to new comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               res.redirect('/camps/' + campground._id);
           }
        });
       }
   });
});

//Comment Edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id:req.params.id, comment:foundComment});
        }
    });
});

//Comment Update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Edited comment");
            res.redirect("/camps/" + req.params.id);
        }
    });
});

//Comment Remove route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err) {
           res.redirect("back");
           console.log(err);
       } else {
           req.flash("success", "Deleted comment");
           res.redirect("/camps/" + req.params.id);
       }
    });
});


module.exports = router;